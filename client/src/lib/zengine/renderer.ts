import {
	PerspectiveCamera,
	Scene,
	Vector2,
	WebGLRenderer,
	WebGLRendererParameters,
	OrthographicCamera
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass'
import Eventor from './eventor'
import { ZGame } from './game'
import { ZScene } from './scene'
import { ScreenSize } from './screen'

export const defaultOptions = () => ({
	renderer: {
		alpha: false,
		antialias: false
	} as WebGLRendererParameters,
	postProcessing: {
		enabled: false,
		bloom: {
			enabled: false
		},
		ssao: {
			enabled: false
		}
	}
})

export type RendererOptions = ReturnType<typeof defaultOptions>

export class Renderer {
	renderer: WebGLRenderer

	onResized = new Eventor()

	effectComposer?: EffectComposer

	passes?: {
		render: RenderPass
		bloom?: UnrealBloomPass
		ssao?: SSAOPass
	}

	options = defaultOptions()

	container: Element

	constructor(public game: ZGame, container?: Element) {
		this.container = container ?? document.getElementsByTagName('body')[0]

		this.renderer = this.createRenderer()

		this.game.screen.onResize.on((size) => this.onResize(size))

		this.applyOptions()
	}

	protected createRenderer() {
		const renderer = new WebGLRenderer(this.options.renderer)

		renderer.setSize(this.game.screen.width, this.game.screen.height)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.shadowMap.enabled = true

		this.container.appendChild(renderer.domElement)

		return renderer
	}

	setAntialiasing(enabled: boolean) {
		if (this.options.renderer.antialias !== enabled) {
			this.options.renderer.antialias = enabled

			this.container.removeChild(this.renderer.domElement)
			this.renderer.dispose()
			this.renderer = this.createRenderer()
		}
	}

	applyOptions() {
		const { postProcessing } = this.options

		if (postProcessing.enabled) {
			this.effectComposer = new EffectComposer(this.renderer)

			this.passes = {
				render: new RenderPass(new Scene(), new PerspectiveCamera())
			}

			this.effectComposer.addPass(this.passes.render)

			if (postProcessing.bloom.enabled) {
				const bloom = new UnrealBloomPass(
					new Vector2(this.game.screen.width, this.game.screen.height),
					1.2,
					0.4,
					0.85
				)

				this.passes.bloom = bloom
				this.effectComposer.addPass(bloom)
			}

			if (postProcessing.ssao.enabled) {
				const ssao = new SSAOPass(
					new Scene(),
					new PerspectiveCamera(),
					this.game.screen.width,
					this.game.screen.height
				)

				ssao.kernelRadius = 16
				this.passes.ssao = ssao
				this.effectComposer.addPass(ssao)
			}
		} else {
			this.effectComposer = undefined
			this.passes = undefined
		}
	}

	protected onResize(size: ScreenSize) {
		this.renderer.setSize(size.width, size.height)
		this.renderer.setPixelRatio(window.devicePixelRatio)

		if (this.game.scene.camera instanceof PerspectiveCamera) {
			this.game.scene.camera.aspect = size.width / size.height
			this.game.scene.camera.updateProjectionMatrix()
		}

		if (this.game.scene.camera instanceof OrthographicCamera) {
			const aspect = size.width / size.height

			this.game.scene.camera.left = (this.game.frustumSize * aspect) / -2
			this.game.scene.camera.right = (this.game.frustumSize * aspect) / 2
			this.game.scene.camera.top = this.game.frustumSize / 2
			this.game.scene.camera.bottom = this.game.frustumSize / -2

			this.game.scene.camera.updateProjectionMatrix()
		}

		if (this.effectComposer) {
			this.effectComposer.setSize(size.width, size.height)
			this.effectComposer.setPixelRatio(window.devicePixelRatio)
		}

		if (this.passes?.bloom) {
			this.passes.bloom.resolution.set(
				this.game.screen.width,
				this.game.screen.height
			)
		}

		if (this.passes?.ssao) {
			this.passes.ssao.setSize(this.game.screen.width, this.game.screen.height)
		}

		this.onResized.trigger()
	}

	render(scene: ZScene) {
		if (this.effectComposer && this.passes) {
			this.passes.render.scene = scene.scene
			this.passes.render.camera = scene.camera

			if (this.passes.ssao) {
				this.passes.ssao.camera = scene.camera
				this.passes.ssao.scene = scene.scene

				if (scene.camera instanceof PerspectiveCamera) {
					this.passes.ssao.ssaoMaterial.uniforms['cameraNear'].value =
						scene.camera.near

					this.passes.ssao.ssaoMaterial.uniforms['cameraFar'].value =
						scene.camera.far

					this.passes.ssao.depthRenderMaterial.uniforms['cameraNear'].value =
						scene.camera.near

					this.passes.ssao.depthRenderMaterial.uniforms['cameraFar'].value =
						scene.camera.far
				}

				this.passes.ssao.ssaoMaterial.uniforms[
					'cameraProjectionMatrix'
				].value.copy(scene.camera.projectionMatrix)

				this.passes.ssao.ssaoMaterial.uniforms[
					'cameraInverseProjectionMatrix'
				].value.getInverse(scene.camera.projectionMatrix)
			}

			this.effectComposer.render()
		} else {
			this.renderer.render(scene.scene, scene.camera)
		}
	}
}

export default Renderer
