// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyWindow = window as any

export class AudioTrack {
	static _ctx: AudioContext

	static get ctx() {
		if (!this._ctx) {
			this._ctx = new (window.AudioContext || anyWindow['webkitAudioContext'])()
		}

		return this._ctx
	}

	buffer?: AudioBuffer

	constructor() {}

	async load(buffer: ArrayBuffer) {
		this.buffer = await AudioTrack.ctx.decodeAudioData(buffer)
	}

	play({ loop = false, offset = 0 }: { loop?: boolean; offset?: number } = {}) {
		if (!this.buffer) {
			throw new Error("Trying to play track that wasn't initialized")
		}

		const trackSource = AudioTrack.ctx.createBufferSource()
		trackSource.buffer = this.buffer
		trackSource.connect(AudioTrack.ctx.destination)
		trackSource.loop = loop
		trackSource.start(0, offset)

		return trackSource
	}
}
