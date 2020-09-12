import { InternalItem, LinkedListItem } from './lib/linked.list'
import { ZScene } from './scene'
import { Component } from './component'

export class ZEntity implements LinkedListItem {
	__llReferences: { [id: number]: InternalItem<ZEntity> } = {}
	__removed = false

	static idCounter = 1

	id = ZEntity.idCounter++

	constructor(public scene: ZScene) {}

	/**
	 * Adds component to this entity.
	 */
	protected addComponent<T extends Component<Options>, Options>(
		cmp: { new (entity: ZEntity, options?: Options): T },
		options?: Options
	) {
		return new cmp(this, options)
	}

	/**
	 * Called when entity is initialized.
	 */
	start() {}

	/**
	 * Removes entity from scene.
	 */
	remove() {
		this.scene.remove(this)
	}

	/**
	 * Called when entity is removed from scene.
	 */
	onRemove() {}

	tick(delta: number) {}
}

export default ZEntity
