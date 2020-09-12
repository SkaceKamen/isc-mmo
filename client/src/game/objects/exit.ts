import Entity3D from '../entity3d'
import { Interactable } from './interactable'
import { MoveUI } from './ui/move-ui'

export class Exit extends Entity3D implements Interactable {
	prompt = 'Move to different room'

	start() {
		this.world.interactables.push(this)
	}

	onRemove() {
		this.world.interactables = this.world.interactables.filter(
			(i) => i !== this
		)
	}

	interact() {
		this.world.create(MoveUI)
	}
}
