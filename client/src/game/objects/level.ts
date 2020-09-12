import { Mesh, Object3D, Vector3 } from 'three'
import { Collider, ColliderLayer } from '../collider'
import Entity3D from '../entity3d'
import { Exit } from './exit'

export class Level extends Entity3D {
	colliders = [] as Collider[]
	spawns = [] as Vector3[]
	exits = [] as Exit[]

	initialize(model: Object3D) {
		const toRemove = [] as Object3D[]

		this.spawns = []

		// Process colliders
		model.traverse((n) => {
			if (n instanceof Mesh && n.name.startsWith('Collider')) {
				const collider = new Collider(this, n.geometry, [
					ColliderLayer.Collision,
					ColliderLayer.Hittable
				])

				collider.position.copy(n.position)
				collider.scale.copy(n.scale)
				collider.quaternion.copy(n.quaternion)

				n.parent?.add(collider)
				this.colliders.push(collider)
				this.world.colliders.push(collider)

				toRemove.push(n)
			}

			if (n.name.startsWith('Spawn')) {
				this.spawns.push(n.position)
				toRemove.push(n)
			}

			if (n.name.startsWith('Exit')) {
				const exit = this.world.createAt(Exit, n.position)
				this.exits.push(exit)
				toRemove.push(n)
			}

			if (n instanceof Mesh) {
				if (n.name !== 'Ground') {
					n.castShadow = true
					n.receiveShadow = false
				} else {
					n.castShadow = false
					n.receiveShadow = true
				}
			}
		})

		toRemove.forEach((n) => {
			n.parent?.remove(n)
		})

		this.transform.add(model)
	}

	hit(source: Entity3D) {
		source.remove()
	}

	onRemove() {
		this.exits.forEach((e) => e.remove())

		this.colliders.forEach((e) => {
			this.world.colliders = this.world.colliders.filter((c) => c !== e)
			e.remove()
		})
	}
}
