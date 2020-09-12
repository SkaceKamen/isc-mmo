import {
	AmbientLight,
	DirectionalLight,
	PerspectiveCamera,
	Vector3
} from 'three'
import { Interactable } from '../objects/interactable'
import { Level } from '../objects/level'
import { NetManager } from '../objects/net-manager'
import Scene from '../scene'

export class World extends Scene {
	manager?: NetManager
	level?: Level
	interactables = [] as Interactable[]

	get<K extends keyof this>(k: K): NonNullable<this[K]> {
		const v = this[k]

		if (v === undefined || v === null) {
			throw new Error(`${k} not found`)
		}

		return v as NonNullable<this[K]>
	}

	async start() {
		await this.game.res.load()
		this.onLoad()
	}

	createCamera() {
		const camera = super.createCamera() as PerspectiveCamera
		camera.fov = 70
		camera.updateProjectionMatrix()

		return camera
	}

	onLoad() {
		this.camera.position.set(4, 8, 0)
		this.camera.lookAt(new Vector3())

		const ambient = new AmbientLight(0xffffff, 1)
		this.scene.add(ambient)

		/*
		// POINT LIGHT ONLY
		const point = new PointLight(0xffffff, 1.5)
		point.position.copy(this.camera.position)
		this.scene.add(point)
		*/

		/*
		// SPOT LIGHT WITH SHADOWS
		const light = new SpotLight(0xffffff, 1.5, 100, Math.PI * 0.3)
		light.position.set(10, 20, 2)

		light.castShadow = true

		light.shadow.mapSize.width = 2048
		light.shadow.mapSize.height = 2048

		light.shadow.camera.near = 1
		light.shadow.camera.far = 100
		light.shadow.camera.fov = 100
		*/

		const light = new DirectionalLight(0xffffff, 1)
		light.position.set(-5, 20, 1)

		light.castShadow = true

		light.shadow.mapSize.width = 1024 * 2
		light.shadow.mapSize.height = 1024 * 2

		light.shadow.camera.near = 1
		light.shadow.camera.far = 100
		light.shadow.camera.left = light.shadow.camera.bottom = -30
		light.shadow.camera.right = light.shadow.camera.top = 30

		this.scene.add(light)

		this.manager = this.create(NetManager)
	}
}
