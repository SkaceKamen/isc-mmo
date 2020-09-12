import { range } from '@/lib/utils'
import { Eventor } from '@/lib/zengine'

export class GamepadManager {
	gamepads = [] as number[]

	onConnected = new Eventor<Gamepad>()
	onDisconnected = new Eventor<Gamepad>()

	constructor() {
		this.update()

		window.addEventListener('gamepadconnected', (e) => {
			this.update()
			this.onConnected.trigger((e as GamepadEvent).gamepad)
		})

		window.addEventListener('gamepaddisconnected', (e) => {
			this.update()
			this.onConnected.trigger((e as GamepadEvent).gamepad)
		})
	}

	update() {
		this.gamepads = range(0, navigator.getGamepads().length)
			.map((i) => (navigator.getGamepads()[i] ? i : null))
			.filter((i) => i !== null) as number[]
	}
}
