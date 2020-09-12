import { html } from 'lighterhtml'
import { ColliderLayer } from '@/game/collider'
import { Debugger } from '../debug'
import { Layers } from 'three'

const hasLayer = (layers: Layers, layer: number) =>
	(layers.mask & (1 << layer)) !== 0

export const renderLayers = (game: Debugger) => {
	const camera = game.scene.camera

	const layers = [
		['Visible', 0],
		...Object.entries(ColliderLayer).filter(
			([, value]) => typeof value === 'number'
		)
	].map(([key, value]) => ({
		layer: value as number,
		label: key,
		enabled: hasLayer(camera.layers, value as number)
	}))

	const layerClick = (l: number) => () => {
		if (hasLayer(camera.layers, l)) {
			camera.layers.disable(l)
		} else {
			camera.layers.enable(l)
		}
	}

	return html` <div class="render-layers">
		${layers.map(
			({ layer, label, enabled }) =>
				html`<div
					class="render-layer${enabled ? ' enabled' : ''}"
					onclick=${layerClick(layer)}
				>
					${label}
				</div>`
		)}
	</div>`
}
