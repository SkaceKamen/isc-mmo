import Entity from '../entity'
import {
	MovedEvent,
	NetClient,
	NewPlayerEvent,
	PlayerRemovedEvent,
	PlayerStateEvent
} from '../net/net-client'
import { LevelManager } from './level-manager'
import { Color } from 'three'
import { PlayerInputDevice } from '../data/devices'
import { Player } from './player'
import {
	myStateMessage,
	NetPlayerState,
	requestMove,
	RoomType
} from '@shared/exports'

const compare2D = (a: [number, number], b: [number, number]) => {
	return a[0] === b[0] && a[1] === b[1]
}

export class NetManager extends Entity {
	client!: NetClient
	manager?: LevelManager

	sendTimeout = 0
	lastState?: NetPlayerState

	get address() {
		if (process.env.APP_SERVER) {
			return process.env.APP_SERVER
		}

		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
		const host = location.host
		const port = location.port

		return `${protocol}//${host}:${port}`
	}

	start() {
		super.start()

		this.manager = this.scene.create(LevelManager)

		this.client = new NetClient({
			address: this.address,
			name: this.game.state.player.name
		})

		this.client.onLogin.on(() => this.handleLogin())
		this.client.onNewPlayer.on((e) => this.handleNewPlayer(e))
		this.client.onPlayerState.on((e) => this.handlePlayerState(e))
		this.client.onPlayerRemoved.on((e) => this.handlePlayerRemoved(e))
		this.client.onMoved.on((e) => this.handleMoved(e))
		this.client.start()
	}

	tick(delta: number) {
		super.tick(delta)

		this.sendTimeout -= delta
	}

	handleLogin() {}

	handleNewPlayer(e: NewPlayerEvent) {
		this.manager?.createRemotePlayer(e.id, {
			color: new Color(0x333333),
			device: PlayerInputDevice.None,
			name: e.name
		})
	}

	handlePlayerState(e: PlayerStateEvent) {
		this.manager?.updateRemotePlayer(e.id, e.state)
	}

	handlePlayerRemoved(e: PlayerRemovedEvent) {
		this.manager?.removeRemotePlayer(e.id)
	}

	handleMoved(e: MovedEvent) {
		this.manager?.moveTo(e.room)
	}

	handlePlayerUpdate(player: Player) {
		if (this.sendTimeout <= 0) {
			const state: NetPlayerState = {
				input: [player.state.input.x, player.state.input.z],
				position: [player.position.x, player.position.z],
				rotation: player.transform.rotation.y,
				velocity: [player.state.velocity.x, player.state.velocity.z]
			}

			if (this.lastState) {
				if (
					compare2D(this.lastState.input, state.input) &&
					compare2D(this.lastState.position, state.position) &&
					compare2D(this.lastState.velocity, state.velocity) &&
					this.lastState.rotation === state.rotation
				) {
					return
				}
			}

			this.client?.sendMessage(myStateMessage(state))

			this.lastState = state
			this.sendTimeout = 0.001
		}
	}

	handleMove(room: RoomType) {
		this.client?.sendMessage(requestMove(room))
	}
}
