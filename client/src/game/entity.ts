/* eslint-disable @typescript-eslint/no-unused-vars */
import { ZEntity } from '@/lib/zengine'
import Scene from './scene'
import { Serializable } from './serializable'
import { World } from './scenes/world'
import { ExportedProperty } from './entity3d'

export default class Entity<Data = {}> extends ZEntity
	implements Serializable<Data> {
	scene: Scene

	state?: Data

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static exportedProperties = {} as Record<string, ExportedProperty<any>>

	constructor(scene: Scene) {
		super(scene)
		this.scene = scene
	}

	serialize(): Data {
		return { ...this.state } as Data
	}

	deserialize(data: Data) {
		this.state = { ...data }
	}

	afterDeserialize(_data: Data) {}

	get world() {
		return this.scene as World
	}

	get game() {
		return this.world.game
	}
}
