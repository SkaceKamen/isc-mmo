import { Eventor } from '@/lib/zengine'
import {
	hiMessage,
	loginMessage,
	NetMessage,
	NetMessageCode,
	NetPlayerState,
	RoomType
} from '@shared/exports'
import { encode, decode } from 'msgpack-lite'

type Options = {
	address: string
	name: string
}

export type NewPlayerEvent = {
	id: number
	name: string
}

export type PlayerStateEvent = {
	id: number
	state: NetPlayerState
}

export type PlayerRemovedEvent = {
	id: number
}

export type MovedEvent = {
	room: RoomType
}

export class NetClient {
	options: Options

	socket?: WebSocket

	onConnected = new Eventor()
	onLogin = new Eventor()
	onDisconnected = new Eventor()
	onNewPlayer = new Eventor<NewPlayerEvent>()
	onPlayerState = new Eventor<PlayerStateEvent>()
	onPlayerRemoved = new Eventor<PlayerRemovedEvent>()
	onMoved = new Eventor<MovedEvent>()

	constructor(options: Options) {
		this.options = options
	}

	start() {
		this.socket = new WebSocket(this.options.address)
		this.socket.onclose = () => this.handleClose()
		this.socket.onerror = (e) => this.handleError(e)
		this.socket.onmessage = (e) => this.handleMessage(e)
		this.socket.onopen = () => this.handleOpen()
	}

	handleOpen() {
		this.onConnected.trigger()
		this.sendMessage(hiMessage())
	}

	handleClose() {
		this.onDisconnected.trigger()
		this.socket = undefined
	}

	handleError(e: Event) {
		console.error('Connection error', e)
	}

	async handleMessage(e: MessageEvent) {
		let data = undefined as NetMessage | undefined

		if (typeof e.data === 'string') {
			data = JSON.parse(e.data) as NetMessage
		} else if (e.data instanceof Blob) {
			data = decode(new Uint8Array(await e.data.arrayBuffer()))
		} else {
			console.log(e.data, typeof e.data)
			throw new Error('Unknown data format')
		}

		if (data) {
			switch (data.type) {
				case NetMessageCode.Hello: {
					return this.sendMessage(loginMessage(this.options.name))
				}

				case NetMessageCode.LoggedIn: {
					return this.onLogin.trigger()
				}

				case NetMessageCode.NewPlayer: {
					return this.onNewPlayer.trigger({ id: data.id, name: data.name })
				}

				case NetMessageCode.PlayerState: {
					return this.onPlayerState.trigger({ id: data.id, state: data.state })
				}

				case NetMessageCode.RemovePlayer: {
					return this.onPlayerRemoved.trigger({ id: data.id })
				}

				case NetMessageCode.MoveToRoom: {
					return this.onMoved.trigger({ room: data.room })
				}

				default: {
					throw new Error(`Unknown message ${data.type}`)
				}
			}
		}
	}

	send(contents: string | ArrayBufferLike | Blob | ArrayBufferView) {
		if (!this.socket) {
			console.log(contents)
			throw new Error('Trying to send message before connecting')
		}

		this.socket.send(contents)
	}

	sendMessage(message: NetMessage) {
		return this.send(encode(message))
	}
}
