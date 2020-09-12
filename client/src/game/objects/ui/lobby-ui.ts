import { EntityUI } from '@/game/entity-ui'
import { html } from 'lighterhtml'
import { World } from '@/game/scenes/world'

export class LobbyUI extends EntityUI {
	state = {
		name: ''
	}

	handleChange = (e: Event) => {
		const input = e.target as HTMLInputElement

		this.setState({
			name: input.value
		})

		this.game.state.player.name = input.value
	}

	handleStart = () => {
		this.game.loadScene(World)
	}

	render() {
		const { name } = this.state

		return html`<div class="lobby">
			<input
				type="text"
				name="name"
				value="${name}"
				onchange="${this.handleChange}"
				placeholder="Player name..."
			/>
			<div class="btn" onclick="${this.handleStart}">Start &gt;</div>
		</div>`
	}
}
