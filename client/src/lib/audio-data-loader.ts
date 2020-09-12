import { AudioTrack } from './audio-track'

export class AudioDataLoader {
	async load(url: string) {
		const response = await fetch(url)
		const arrayBuffer = await response.arrayBuffer()

		return this.parse(arrayBuffer)
	}

	async parse(data: ArrayBuffer) {
		const track = new AudioTrack()
		await track.load(data)

		return track
	}
}
