import { html } from 'lighterhtml'
import Entity3D from '@/game/entity3d'
import { ZGame } from '@/lib/zengine'

export const entitySelector = (
	game: ZGame,
	selected: Entity3D | undefined,
	onSelect: (e: Entity3D | undefined) => void
) => {
	const entities = game.scene.entities.array() as Entity3D[]

	const handleChange = (e: Event) => {
		const select = e.target as HTMLSelectElement
		const id = parseInt(select.value, 10)

		console.log('change', e)

		onSelect(entities.find((e) => e.id === id))
	}

	return html`
		<div class="entity-selector">
			<select onchange="${handleChange}">
				<option>- Select something -</option>
				${entities.map(
					(e) => html`
						<option value="${e.id}" selected="${e === selected}">
							${e.constructor.name} (${e.id})
						</option>
					`
				)}
			</select>
		</div>
	`
}
