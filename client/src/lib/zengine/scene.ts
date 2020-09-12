import { LinkedList } from './lib/linked.list'
import { ZEntity } from './entity'
import { ZGame } from './game'
import { Camera, PerspectiveCamera, Scene } from 'three'
import Eventor from './eventor'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ZScene {
	entities = new LinkedList<ZEntity>()

	scene: Scene
	camera: Camera

	onLeave = new Eventor()

	constructor(public game: ZGame) {
		this.camera = this.createCamera()
		this.scene = this.createScene()

		this.scene.name = 'Scene'
		this.camera.name = 'Main camera'
	}

	/**
	 * Called when scene is ready.
	 */
	start() {}

	/**
	 * Builds main camera used for this scene.
	 */
	protected createCamera(): Camera {
		return new PerspectiveCamera(
			70,
			this.game.screen.width / this.game.screen.height
		)
	}

	/**
	 * Builds main camera used for this scene.
	 */
	protected createScene() {
		return new Scene()
	}

	/**
	 * Creates new instance of specified entity.
	 */
	create<T extends ZEntity, This extends ZScene = this>(base: {
		new (scene: This): T
	}) {
		const instance = new base((this as unknown) as This)
		instance.start()
		this.entities.push(instance)

		return instance
	}

	/**
	 * Finally removes entity from scene
	 */
	remove(entity: ZEntity) {
		if (entity.__removed) {
			console.warn('Trying to remove already removed entity')

			return
		}

		entity.onRemove()

		entity.__removed = true

		this.entities.remove(entity)
	}

	/**
	 * Calls tick for every entity.
	 */
	update(delta: number) {
		let item

		this.entities.iter.reset()

		while ((item = this.entities.iter.next())) {
			item.tick(delta)
		}
	}

	/**
	 * Renders current scene.
	 */
	render(delta: number) {
		this.game.renderer.render(this)
	}

	/**
	 * Called when game scene changes
	 */
	onChanged() {
		this.onLeave.trigger()
	}
}

export default ZScene
