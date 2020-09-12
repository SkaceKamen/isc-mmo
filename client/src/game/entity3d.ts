/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZEntity3D } from '@/lib/zengine'
import { Collider } from './collider'
import Scene from './scene'
import { World } from './scenes/world'
import { Serializable } from './serializable'
import { Hole } from 'lighterhtml'
import { BatchJobs } from './lib/batch-jobs'

export type Entity3DData = {
	position: number[]
	quaternion: number[]
	scale: number[]
}

export enum PropertyType {
	Number,
	String,
	NumberRange,
	Choice,
	Custom
}

export type ChoiceType = { value: any; label: string }

export type ExportedProperty<T extends Entity3D = Entity3D> = {
	type: PropertyType

	min?: number
	max?: number
	step?: number

	choices?: ChoiceType[] | ((entity: T) => ChoiceType[])

	render?: (value: any, entity: T, onChange: (v: any) => void) => Hole

	get?: (entity: T) => any
	set?: (v: any, entity: T) => void
}

export const exportedProperties = <T extends Entity3D>(
	p: Record<string, ExportedProperty<T>>
) => p

export default abstract class Entity3D<T = {}> extends ZEntity3D
	implements Serializable<T & Entity3DData> {
	static exportedProperties = {} as Record<string, ExportedProperty<any>>

	state?: T

	scene: Scene
	collider?: Collider

	jobs = new BatchJobs()

	constructor(scene: Scene) {
		super(scene)
		this.scene = scene
	}

	tick(delta: number) {
		super.tick(delta)

		this.jobs.tick()
	}

	serialize() {
		return {
			position: this.position.toArray(),
			quaternion: this.transform.quaternion.toArray(),
			scale: this.transform.scale.toArray(),
			...this.state
		} as T & Entity3DData
	}

	deserialize(data: T & Entity3DData) {
		const { position, quaternion, scale, ...state } = data

		this.position.fromArray(position)
		this.transform.quaternion.fromArray(quaternion)
		this.transform.scale.fromArray(scale)

		this.state = ({ ...state } as unknown) as T
	}

	afterDeserialize(_data: T & Entity3DData) {}

	onRemove() {
		super.onRemove()

		this._removeCollider()
	}

	_removeCollider() {
		if (!this.collider) {
			return
		}

		const i = this.world.colliders.indexOf(this.collider)

		if (i >= 0) {
			this.world.colliders.splice(i, 1)
		} else {
			console.warn('Trying to remove already removed collider')
		}
	}

	get world() {
		return this.scene as World
	}

	get game() {
		return this.world.game
	}

	get settings() {
		return this.game.settings
	}
}
