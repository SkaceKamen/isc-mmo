import { ZGame } from '@/lib/zengine'
import { html } from 'lighterhtml'

export const gameControls = (game: ZGame) => {
	const handleClick = () => {
		game.paused = !game.paused
	}

	return html`<div class="game-controls">
		<div class="btn" onclick=${handleClick}>
			${game.paused ? 'Resume' : 'Pause'}
		</div>
	</div>`
}
