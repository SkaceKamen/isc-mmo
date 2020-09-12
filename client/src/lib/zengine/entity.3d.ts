import { Object3D, Vector3 } from 'three'
import { ZEntity } from './entity'
import { LinkedList } from './lib/linked.list'
import ZScene from './scene'

export class ZEntity3D extends ZEntity {
	transform: Object3D

	parent?: ZEntity3D
	children = new LinkedList<ZEntity3D>()

	get rotation() {
		return this.transform.quaternion
	}

	get position() {
		return this.transform.position
	}

	get forward() {
		return new Vector3(0, 0, 1).applyQuaternion(this.rotation)
	}

	constructor(scene: ZScene) {
		super(scene)

		this.transform = new Object3D()
		this.transform.name = 'Entity'
		this.scene.scene.add(this.transform)
	}

	/**
	 * Removes entity from scene.
	 */
	remove() {
		if (!this.parent) {
			this.scene.scene.remove(this.transform)
		} else {
			this.parent.children.remove(this)
			this.parent.transform.remove(this.transform)
		}

		super.remove()
	}

	/**
	 * Adds entity as child to this entity
	 * @param base
	 */
	create<T extends ZEntity3D, Scene extends ZScene = ZScene>(base: {
		new (scene: Scene): T
	}) {
		const instance = this.scene.create(base)

		this.children.push(instance)

		// Needed when removing child
		instance.parent = this
		// Remove from normal scene
		this.scene.scene.remove(instance.transform)
		// Add it to this entity
		this.transform.add(instance.transform)

		return instance
	}
}

export default ZEntity3D
