import { GameClient } from '@/server/game-client'
import { MyEvent } from '@/utils/events'
import { NetPlayerState } from '@shared/exports'
import { Room } from './room'

export class Player {
	id: number
	client: GameClient
	room?: Room

	name = ''

	state = {
		position: [0, 0],
		rotation: 0,
		velocity: [0, 0]
	} as NetPlayerState

	onRoomChanged = new MyEvent<Room>()

	get game() {
		return this.client.server.game
	}

	constructor(client: GameClient) {
		this.client = client
		this.id = this.game.getNextId()
	}

	moveTo(room: Room) {
		if (this.room) {
			this.room.remove(this)
		}

		this.room = room
		this.room.add(this)

		this.onRoomChanged.emit(room)
	}
}
