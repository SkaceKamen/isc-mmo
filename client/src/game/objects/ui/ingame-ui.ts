import { EntityUI } from '@/game/entity-ui'
import { worldToScreen } from '@/lib/utils'
import { html } from 'lighterhtml'
import { Vector3 } from 'three'
import { Interactable } from '../interactable'
import { Player } from '../player'
import { PlayerManager } from '../player-manager'

export class IngameUI extends EntityUI {
	state = {
		time: 0,
		interactable: undefined as Interactable | undefined,
		manager: undefined as PlayerManager | undefined
	}

	tick(delta: number) {
		const player = this.state.manager?.state.player

		this.setState({ time: this.state.time + delta })

		if (player) {
			this.setState({
				interactable: player.state.interactable
			})
		}

		super.tick(delta)
	}

	render() {
		const { interactable } = this.state
		let interactablePosition = undefined as Vector3 | undefined

		if (interactable) {
			interactablePosition = worldToScreen(
				this.world.camera,
				this.game.screen,
				interactable.position
			)
		}

		return html`<div class="ingame">
			${interactable &&
			interactablePosition &&
			html`<div
				class="interactable"
				style="left: ${interactablePosition.x}px; top: ${interactablePosition.y}px;"
			>
				[E] to ${interactable.prompt}
			</div>`}
		</div>`
	}
}
