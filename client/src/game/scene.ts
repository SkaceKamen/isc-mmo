import { ZEntity, ZScene } from '@/lib/zengine'
import { Collider } from './collider'
import Entity from './entity'
import Entity3D from './entity3d'
import { Game } from './game'
import { Serializable } from './serializable'
import { Vector3, Quaternion } from 'three'

export default class Scene<Data = undefined> extends ZScene
	implements Serializable<Data> {
	game: Game

	colliders: Collider[] = []

	constructor(game: Game) {
		super(game)
		this.game = game
	}

	/**
	 * Finds all entities of specified class
	 * @param base class to find
	 * @return list of found entities
	 */
	find<T extends Entity>(base: { new (scene: Scene): T }, single = false): T[] {
		const results = []
		const it = this.entities.createIter()
		let item

		while ((item = it.next())) {
			if (item instanceof base) {
				results.push(item)

				if (single) {
					break
				}
			}
		}

		return results
	}

	/**
	 * Finds single entity of specified class
	 * @param base class to find
	 * @return found entity or null
	 */
	findSingle<T extends Entity>(base: { new (scene: Scene): T }): T | null {
		const found = this.find(base, true)

		return found.length > 0 ? found[0] : null
	}

	serialize() {
		return (undefined as unknown) as Data
	}
	deserialize(data: Data) {}
	afterDeserialize(data: Data) {}

	/**
	 * Creates new instance of specified entity.
	 */
	create<T extends ZEntity, This extends ZScene = Scene<Data>>(base: {
		new (scene: This): T
	}) {
		const instance = super.create(base)

		if (instance instanceof Entity3D && instance.collider) {
			this.colliders.push(instance.collider)
		}

		return instance
	}

	/**
	 * Creates new instance of specified entity.
	 */
	createAt<
		T extends Entity3D | (Entity & { position: Vector3 }),
		This extends ZScene = Scene<Data>
	>(
		base: {
			new (scene: This): T
		},
		position: Vector3
	) {
		const instance = this.create(base)

		instance.position.copy(position)

		return instance
	}
}
