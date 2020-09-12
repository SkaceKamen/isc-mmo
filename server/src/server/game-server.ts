import { Game } from '@/game/game'
import { Player } from '@/game/player'
import { MyEvent } from '@/utils/events'
import { Logger } from '@/utils/log'
import { NetMessage, removePlayerMessage } from '@shared/exports'
import { IncomingMessage } from 'http'
import { Socket } from 'net'
import WebSocket from 'ws'
import { GameClient } from './game-client'

export class GameServer {
	logger = new Logger('GameServer')

	socket: WebSocket.Server

	game = new Game()

	clients: GameClient[] = []

	onEnded = new MyEvent()
	onEmpty = new MyEvent()
	onClose = new MyEvent()

	constructor() {
		this.socket = new WebSocket.Server({ noServer: true })
		this.socket.on('connection', this.handleConnection)
	}

	get acceptsConnections() {
		return true
	}

	handleUpgrade = (
		request: IncomingMessage,
		socket: Socket,
		upgradeHead: Buffer
	) => {
		this.socket.handleUpgrade(request, socket, upgradeHead, ws => {
			this.socket.emit('connection', ws)
		})
	}

	handleConnection = (s: WebSocket) => {
		const client = new GameClient(this, s)
		client.onDisconnected.on(() => this.handleDisconnect(client))
		this.clients.push(client)
	}

	handleDisconnect = (client: GameClient) => {
		this.clients = this.clients.filter(i => i !== client)

		if (client.player && client.player.room) {
			client.player.room.sendAllBut(
				removePlayerMessage(client.player.id),
				client.player
			)

			client.player.room.remove(client.player)
		}
	}

	sendAllBut(message: NetMessage, but: Player) {
		this.clients.forEach(c => {
			if (c.player !== but) {
				c.send(message)
			}
		})
	}

	close() {
		this.socket.close()

		this.clients.forEach(c => {
			c.socket.close()
		})

		this.clients = []
		this.onClose.emit()
	}
}
