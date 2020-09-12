import {
	Mesh,
	Geometry,
	MeshBasicMaterial,
	BufferGeometry,
	DoubleSide
} from 'three'
import Entity3D from './entity3d'

export type ColliderOwner = {
	hit(source: Entity3D): boolean | void
	__removed: boolean
}

export enum ColliderLayer {
	Collision = 1,
	Player,
	Enemy,
	Hittable
}

export class Collider extends Mesh {
	owner: ColliderOwner
	penetrable = false
	shield = false

	constructor(
		owner: ColliderOwner,
		geometry: Geometry | BufferGeometry,
		layers = [ColliderLayer.Collision]
	) {
		super(
			geometry,
			new MeshBasicMaterial({
				wireframe: true,
				color: 0xffff00,
				side: DoubleSide
			})
		)

		this.owner = owner
		this.visible = true

		this.layers.disableAll()

		layers.forEach((l) => {
			this.layers.enable(l)
		})
	}
}
