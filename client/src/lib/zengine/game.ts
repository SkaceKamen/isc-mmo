import { ZScene } from './scene'
import { Renderer } from './renderer'
import { ZEntity } from './entity'
import { Time } from './time'
import { Mouse } from './mouse'
import { Screen } from './screen'
import { Eventor } from './eventor'
import { setGlobal, requestAnimationFramePolyfill } from './utils'

export function fixed(input: number, n = 3) {
	const ex = Math.pow(10, n)

	return Math.round(input * ex) / ex
}

export interface SceneChangedData {
	previous: ZScene
	current: ZScene
}

export class ZGame {
	scene: ZScene
	renderer: Renderer

	time: Time
	mouse: Mouse
	screen: Screen

	targetFps = 60
	frustumSize = 20

	window: Window

	paused = false

	deltaMultiplier = 1

	protected interval = 0
	protected stopped = false

	onSceneChanged: Eventor<SceneChangedData>

	constructor(win?: Window) {
		this.window = win || window

		this.onSceneChanged = new Eventor()

		this.time = new Time()
		this.mouse = new Mouse()
		this.screen = new Screen(this, this.window)
		this.renderer = new Renderer(this)
		this.scene = new ZScene(this)

		this.initTicker()
		this.start()
	}

	/**
	 * Called when engine is initialized.
	 */
	protected start() {
		this.tick(0)
	}

	stop() {
		this.stopped = true
	}

	loadScene<T extends ZScene, This extends ZGame = this>(scene: {
		new (game: This): T
	}) {
		const previous = this.scene

		if (previous) {
			previous.onChanged()
		}

		this.scene = new scene((this as unknown) as This)
		this.scene.start()

		this.onSceneChanged.trigger({ previous, current: this.scene })

		// For debuggers
		setGlobal('scene', this.scene.scene)

		return this.scene as T
	}

	/**
	 * Creates new instance of specified entity.
	 */
	create<T extends ZEntity>(base: { new (scene: ZScene): T }) {
		return this.scene.create(base)
	}

	/**
	 * Creates appropriate frame update function
	 * @source https://github.com/underscorediscovery/realtime-multiplayer-in-html5/blob/master/game.core.js
	 */
	protected initTicker() {
		this.time.sleep = 1000 / this.targetFps
		requestAnimationFramePolyfill()
	}

	protected tick(t: number) {
		if (this.stopped) {
			delete this.scene

			return
		}

		// Schedule the next update
		this.interval = requestAnimationFrame((t) => this.tick(t))

		// Work out the delta time
		// this.time.delta = this.time.sleep / 1000

		// TODO: This doesn't work properly (probably?)
		this.time.delta = Math.min(
			1,
			this.time.lastFrameTime
				? fixed((t - this.time.lastFrameTime) / 1000.0)
				: this.time.sleep / 1000
		)

		// Store the last frame time
		this.time.lastFrameTime = t

		// Update real mouse position with view
		this.mouse.x = this.mouse.elementX
		this.mouse.y = this.mouse.elementY

		if (!this.paused) {
			// Update the game specifics
			this.update(this.time.delta * this.deltaMultiplier)
			this.render(this.time.delta * this.deltaMultiplier)
		}
	}

	/**
	 * Calls tick for every entity.
	 */
	update(delta: number) {
		this.scene.update(delta)
	}

	/**
	 * Renders current scene.
	 */
	render(delta: number) {
		this.scene.render(delta)
	}
}

export default ZGame
