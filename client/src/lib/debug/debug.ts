import {
	AmbientLight,
	GridHelper,
	Object3D,
	Vector3,
	CameraHelper,
	PointLight,
	PointLightHelper,
	DirectionalLight,
	DirectionalLightHelper,
	SpotLightHelper,
	SpotLight
} from 'three'
import { OrbitControls } from '../zengine/controls/orbit-controls'
import { Eventor } from '../zengine/eventor'
import { ZGame } from '../zengine/game'
import { Renderer } from '../zengine/renderer'
import { ZScene } from '../zengine/scene'
import { Screen } from '../zengine/screen'
import { Controls } from './controls'

export class Debugger extends ZGame {
	game?: ZGame

	onClose: Eventor<void> = new Eventor<void>()

	controls?: OrbitControls

	protected start() {
		this.open()
		super.start()
	}

	getParentStyles() {
		const styleTags = document.getElementsByTagName('style')
		let styles = ''

		for (let i = 0; i < styleTags.length; i++) {
			styles += styleTags[i].innerText
		}

		return styles
	}

	update(delta: number) {
		const styleElement = this.window.document.querySelector('style')
		const parentStyle = this.getParentStyles()

		if (styleElement && this.getParentStyles() !== styleElement?.innerHTML) {
			styleElement.innerHTML = parentStyle
		}

		super.update(delta)
	}

	open() {
		const left = localStorage.getItem('left') || 0
		const top = localStorage.getItem('top') || 0
		const width = localStorage.getItem('width') || 800
		const height = localStorage.getItem('height') || 640

		const opened = window.open(
			'',
			'_blank',
			'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top
		)

		if (!opened) {
			throw new Error('Failed to open debug window')
		}

		this.window = opened

		this.window.document.head.innerHTML += `
			<title>ZEngine Debug</title>
			<style>${this.getParentStyles()}</style>
		`

		this.window.document.body.className = 'debugger'

		this.window.moveTo(parseFloat(left.toString()), parseFloat(top.toString()))

		this.screen = new Screen(this, this.window)

		if (this.renderer) {
			document.body.removeChild(this.renderer.renderer.domElement)
		}

		this.renderer = new Renderer(
			this,
			this.window.document.getElementsByTagName('body')[0]
		)

		this.loadScene(DebugHelperScene)

		this.window.onresize = () => {
			localStorage.setItem('width', this.window.outerWidth.toString())
			localStorage.setItem('height', this.window.outerHeight.toString())
			localStorage.setItem('left', this.window.screenLeft.toString())
			localStorage.setItem('top', this.window.screenTop.toString())
		}

		this.window.onunload = () => {
			this.stop()

			this.onClose.trigger()
		}

		window.onunload = () => {
			this.window.close()
		}

		this.controls = new OrbitControls(
			this.scene.camera,
			this.renderer.renderer.domElement,
			this.window.document
		)
	}

	get helperScene() {
		return this.scene as DebugHelperScene
	}

	assign(game: ZGame) {
		console.log('assigned game', game)
		this.game = game
		this.helperScene.tracked = game
	}

	tick(t: number) {
		super.tick(t)

		this.controls?.update()
	}
}

export class DebugHelperScene extends ZScene {
	tracked?: ZGame
	gameScene?: ZScene
	grid?: Object3D
	cameraHelper?: CameraHelper
	lightHelpers?: Object3D[]

	start() {
		super.start()

		this.scene.add((this.grid = new GridHelper(1000, 100)))
		this.scene.add(new AmbientLight(0xffffff, 0.2))

		this.grid.position.setY(-0.1)

		this.camera.position.set(10, 20, 10)
		this.camera.lookAt(new Vector3())

		const controls = this.create(Controls)
		this.game.window.document.body.appendChild(controls.container)
	}

	update(delta: number) {
		super.update(delta)

		if (this.tracked) {
			if (!this.cameraHelper) {
				console.log('Creating camera helper')

				this.scene.add(
					(this.cameraHelper = new CameraHelper(this.tracked.scene.camera))
				)
			}

			if (!this.lightHelpers) {
				const helpers = (this.lightHelpers = [] as Object3D[])

				this.tracked.scene.scene.traverse((n) => {
					if (n instanceof PointLight) {
						helpers.push(new PointLightHelper(n))
					}

					if (n instanceof DirectionalLight) {
						helpers.push(new DirectionalLightHelper(n))
					}

					if (n instanceof SpotLight) {
						helpers.push(new SpotLightHelper(n))
					}
				})

				helpers.forEach((h) => this.scene.add(h))
			}

			if (this.gameScene != this.tracked.scene) {
				if (this.gameScene) {
					this.scene.remove(this.gameScene.scene)
				}

				this.gameScene = this.tracked.scene
				this.scene.add(this.gameScene.scene)
			}
		}
	}
}
