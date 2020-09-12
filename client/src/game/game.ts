import { Eventor, ZGame } from '@/lib/zengine'
import Stats from 'stats.js'
import { Color } from 'three'
import { GamepadManager } from './lib/gamepad-manager'
import { loadProgress, saveProgress } from './progress'
import { res } from './res'
import Scene from './scene'
import { Lobby } from './scenes/lobby'
import { loadSettings, saveSettings } from './settings'
import { ProgressData } from './states/progress'
import { Antialiasing, ShadowsLevel } from './states/settings'
import { defaultStatsState, StatsState } from './states/stats'
import { PlayerInputDevice } from './data/devices'

export type PlayerOptions = {
	device: PlayerInputDevice
	color: Color
	name: string
}

export class Game extends ZGame {
	scene: Scene

	state = {
		stats: defaultStatsState(),
		globalStats: defaultStatsState(),
		settings: loadSettings(),
		progress: loadProgress(),

		player: {
			device: PlayerInputDevice.Keyboard1,
			color: new Color(0x11540d),
			name: 'Player'
		}
	}

	res = res
	stats = new Stats()
	onSettingsChanged = new Eventor()

	gamepadManager = new GamepadManager()

	get settings() {
		return this.state.settings
	}

	get progress() {
		return this.state.progress
	}

	constructor() {
		super()

		this.scene = this.loadScene(Lobby)

		this.stats.dom.style.left = ''
		this.stats.dom.style.right = '0px'

		document.body.appendChild(this.stats.dom)

		this.renderer.onResized.on(() => {
			this.applySettings()
		})

		this.applySettings()
	}

	applySettings() {
		this.renderer.setAntialiasing(
			this.state.settings.antialiasing === Antialiasing.Native
		)

		this.renderer.renderer.setPixelRatio(
			this.state.settings.resolution * window.devicePixelRatio
		)

		this.renderer.renderer.shadowMap.enabled =
			this.state.settings.shadows !== ShadowsLevel.Disabled

		this.renderer.options.postProcessing.enabled = this.state.settings.postProcessing
		this.renderer.applyOptions()

		this.onSettingsChanged.trigger()

		saveSettings(this.state.settings)
	}

	updateStat<K extends keyof StatsState>(
		k: K,
		v: (v: StatsState[K]) => StatsState[K]
	) {
		const newValue = v(this.state.stats[k])

		this.state.stats = {
			...this.state.stats,
			[k]: newValue
		}

		this.state.globalStats = {
			...this.state.globalStats,
			[k]: newValue
		}
	}

	updateProgress(
		value: Partial<ProgressData> | ((p: ProgressData) => ProgressData)
	) {
		const newValue =
			typeof value === 'function'
				? value(this.state.progress)
				: { ...this.state.progress, ...value }

		this.state.progress = newValue

		saveProgress(this.state.progress)
	}

	tick(t: number) {
		this.stats?.begin()

		super.tick(t)

		this.stats?.end()
	}
}
