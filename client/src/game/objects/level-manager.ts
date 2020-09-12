import { NetPlayerState, RoomType } from '@shared/exports'
import { Levels } from '../data/levels'
import Entity from '../entity'
import { PlayerOptions } from '../game'
import { Level } from './level'
import { PlayerManager } from './player-manager'
import { IngameUI } from './ui/ingame-ui'

export class LevelManager extends Entity {
	state = {
		level: undefined as Level | undefined,
		local: undefined as PlayerManager | undefined,
		remote: {} as Record<number, PlayerManager>
	}

	clear() {
		if (this.state.level) {
			this.state.level.remove()
			this.state.level = undefined
		}

		if (this.state.local) {
			this.state.local.remove()
			this.state.local = undefined
		}

		Object.values(this.state.remote).forEach((p) => {
			p.remove()
		})

		this.state.remote = {}
	}

	moveTo(room: RoomType) {
		this.clear()

		this.state.level = this.world.create(Level)
		this.state.level.initialize(Levels[room].model(this.world))
		this.world.level = this.state.level

		this.createLocalPlayer(this.game.state.player)
	}

	createLocalPlayer(options: PlayerOptions) {
		this.state.local = this.world.create(PlayerManager).options(options)
	}

	createRemotePlayer(id: number, options: PlayerOptions) {
		const player = this.world.create(PlayerManager).options(options, true)
		this.state.remote[id] = player
	}

	updateRemotePlayer(id: number, state: NetPlayerState) {
		const player = this.state.remote[id]

		if (player) {
			player.update(state)
		} else {
			console.warn('Unknown player #', id)
		}
	}

	removeRemotePlayer(id: number) {
		const player = this.state.remote[id]

		if (player) {
			player.remove()
			delete this.state.remote[id]
		} else {
			console.warn('Unknown player #', id)
		}
	}
}
