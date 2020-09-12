import Entity3D from '@/game/entity3d'
import { StateData } from '@/game/state-data'
import { html, render } from 'lighterhtml'
import { ZEntity } from '../zengine'
import { entitySelector } from './components/entity-selector'
import { gameControls } from './components/game-controls'
import { renderLayers } from './components/render-layers'
import { Debugger, DebugHelperScene } from './debug'
import { entityInspector } from './components/entity-inspector'

export class Controls extends ZEntity {
	state = new StateData({
		paused: false,
		selected: undefined as ZEntity | undefined,
		mounted: false
	})

	container = document.createElement('div')

	get parent() {
		return this.scene.game as Debugger
	}

	get helperScene() {
		return this.scene as DebugHelperScene
	}

	start() {
		this.container.className = 'debugger-controls'
		render(this.container, this.render())
	}

	tick() {
		if (!this.state.data.mounted && this.parent.game) {
			this.state.setValue('mounted', true)
		}

		if (this.state.updated) {
			render(this.container, this.render())
		}
	}

	render() {
		const state = this.state.data
		const game = this.parent.game

		if (!game) {
			return html`No game attached`
		}

		const handleEntitySelect = (e: Entity3D | undefined) => {
			this.state.setValue('selected', e as ZEntity)
		}

		return html`
			<div class="controls">
				${gameControls(game)} ${renderLayers(this.parent)}
				${entitySelector(game, state.selected as Entity3D, handleEntitySelect)}
				${entityInspector(state.selected as Entity3D)}
			</div>
		`
	}
}
