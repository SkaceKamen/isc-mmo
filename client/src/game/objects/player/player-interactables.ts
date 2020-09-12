import { PlayerComponent } from './player-component'

export class PlayerInteractables extends PlayerComponent {
	tick() {
		this.player.state.interactable = this.player.world.interactables.find(
			(i) => i.position.distanceTo(this.player.position) < 2
		)
	}
}
