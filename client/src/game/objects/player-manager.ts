import { pickRandom } from '@/lib/utils'
import { NetPlayerState } from '@shared/exports'
import { Color, Vector3 } from 'three'
import { PlayerInputDevice } from '../data/devices'
import Entity from '../entity'
import { PlayerOptions } from '../game'
import { Player } from './player'
import { IngameUI } from './ui/ingame-ui'

export enum PlayerManagerState {
	Respawning = 1,
	Playing
}

export class PlayerManager extends Entity {
	state = {
		remote: false,
		state: PlayerManagerState.Respawning,
		respawn: 0,

		options: {
			color: new Color(0x000000),
			device: PlayerInputDevice.Keyboard1
		} as PlayerOptions,

		player: undefined as Player | undefined,
		ui: undefined as IngameUI | undefined
	}

	options(options: PlayerOptions, remote = false) {
		this.state.options = options
		this.state.remote = remote

		if (!this.state.remote) {
			this.state.ui = this.scene.create(IngameUI)
			this.state.ui.state.manager = this
		}

		return this
	}

	update(state: NetPlayerState) {
		if (this.state.player) {
			this.state.player.position.set(
				state.position[0],
				this.state.player.position.y,
				state.position[1]
			)

			this.state.player.state.velocity.set(
				state.velocity[0],
				this.state.player.state.velocity.y,
				state.velocity[1]
			)

			this.state.player.state.input.set(
				state.input[0],
				this.state.player.state.input.y,
				state.input[1]
			)

			this.state.player.rotation.setFromAxisAngle(
				new Vector3(0, 1, 0),
				state.rotation
			)
		}
	}

	tick(delta: number) {
		if (this.state.player?.__removed) {
			this.state.player = undefined
			this.state.state = PlayerManagerState.Respawning
			this.state.respawn = 2
		}

		switch (this.state.state) {
			case PlayerManagerState.Respawning: {
				this.state.respawn -= delta

				if (this.state.respawn <= 0) {
					this.state.state = PlayerManagerState.Playing

					const spawn = pickRandom(this.world.get('level').spawns)

					this.state.player = this.world
						.createAt(Player, spawn)
						.options(this.state.options, this.state.remote)
				}

				break
			}
		}

		if (this.state.player && !this.state.remote) {
			this.world.get('manager').handlePlayerUpdate(this.state.player)
		}
	}

	onRemove() {
		if (this.state.player) {
			this.state.player.remove()
		}

		if (this.state.ui) {
			this.state.ui.remove()
		}
	}
}
