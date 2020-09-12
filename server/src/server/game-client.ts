import { Player } from '@/game/player'
import { MyEvent } from '@/utils/events'
import { Logger } from '@/utils/log'
import {
	helloMessage,
	loggedInMessage,
	moveToRoom,
	NetMessage,
	NetMessageCode,
	newPlayerMessage,
	playerStateMessage,
	Rooms,
	RoomType
} from '@shared/exports'
import { decode, encode } from 'msgpack-lite'
import WebSocket from 'ws'
import { GameServer } from './game-server'

enum ClientState {
	Initializing,
	Connected
}

export class GameClient {
	get logger() {
		return new Logger(
			this.player ? `GameClient(${this.player.name})` : 'GameClient'
		)
	}

	player?: Player

	server: GameServer
	socket: WebSocket
	state: ClientState

	onDisconnected = new MyEvent()

	constructor(server: GameServer, socket: WebSocket) {
		this.server = server
		this.state = ClientState.Initializing

		this.socket = socket
		this.socket.on('message', this.handleRawMessage)
		this.socket.on('close', this.handleClose)
	}

	handleClose = () => {
		this.onDisconnected.emit()
	}

	handleRawMessage = (data: WebSocket.Data) => {
		let parsed: NetMessage

		try {
			if (typeof data === 'string') {
				parsed = JSON.parse(data.toString())
			} else if (data instanceof ArrayBuffer) {
				parsed = decode(new Uint8Array(data))
			} else {
				if (Array.isArray(data)) {
					data = Buffer.concat(data)
				}

				parsed = decode(data as Buffer)
			}
		} catch (e) {
			this.logger.error('Failed to parse message', e)

			return
		}

		const result = this.handleMessage(parsed)

		if (result) {
			this.send(result)
		}
	}

	handleMessage(message: NetMessage) {
		switch (message.type) {
			case NetMessageCode.Hi: {
				return helloMessage()
			}

			case NetMessageCode.Login: {
				const player = new Player(this)
				player.name = message.name
				this.player = player

				player.onRoomChanged.on(room => {
					this.send(moveToRoom(room.type))

					room.sendAllBut(newPlayerMessage(player.id, player.name), player)

					room.players.forEach(c => {
						if (c !== player) {
							this.send(newPlayerMessage(c.id, c.name))
						}
					})
				})

				player.moveTo(this.server.game.rooms[RoomType.Point])

				return loggedInMessage()
			}

			case NetMessageCode.MyState: {
				if (this.player) {
					this.server.sendAllBut(
						playerStateMessage(this.player.id, message.state),
						this.player
					)
				}

				return
			}

			case NetMessageCode.RequestMove: {
				if (this.player) {
					this.player.moveTo(this.server.game.rooms[message.room])
				}

				return
			}
		}
	}

	send(update: NetMessage) {
		this.socket.send(encode(update))
	}
}
