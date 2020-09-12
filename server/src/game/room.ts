import { NetMessage } from '@shared/exports'
import { RoomType } from '@shared/rooms'
import { Game } from './game'
import { Player } from './player'

export class Room {
	game: Game
	type: RoomType
	players = [] as Player[]

	constructor(game: Game, type: RoomType) {
		this.game = game
		this.type = type
	}

	add(player: Player) {
		this.players.push(player)
	}

	remove(player: Player) {
		this.players.splice(this.players.indexOf(player), 1)
	}

	sendAllBut(message: NetMessage, but: Player) {
		this.players.forEach(p => {
			if (p !== but) {
				p.client.send(message)
			}
		})
	}
}
