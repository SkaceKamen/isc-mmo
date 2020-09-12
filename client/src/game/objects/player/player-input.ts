import { Vector3 } from 'three'
import { PlayerComponent } from './player-component'
import {
	PlayerAction,
	inputDevices,
	PlayerInputDevice
} from '@/game/data/devices'

export class PlayerInput extends PlayerComponent {
	tick() {
		if (this.player.state.device !== PlayerInputDevice.None) {
			this.state.input.set(0, 0, 0)
			this.processInput()
		}
	}

	processInput() {
		const input = new Vector3()

		if (this.isPressed('up')) {
			input.add(new Vector3(-1, 0, 0))
		}

		if (this.isPressed('down')) {
			input.add(new Vector3(1, 0, 0))
		}

		if (this.isPressed('left')) {
			input.add(new Vector3(0, 0, 1))
		}

		if (this.isPressed('right')) {
			input.add(new Vector3(0, 0, -1))
		}

		input.normalize()

		this.state.input.copy(input)

		if (
			this.isPressed('action') &&
			this.player.state.interactable &&
			!this.player.state.interacting
		) {
			this.player.state.interacting = true

			this.player.state.interactable.interact(this.player, () => {
				this.player.state.interacting = false
			})
		}
	}

	isPressed(action: PlayerAction) {
		const device = inputDevices[this.player.state.device]
		const scheme = device.scheme

		if ('gamepadIndex' in device) {
			for (const key of scheme[action]) {
				if (this.player.gamepad.isPressed(+key)) {
					return true
				}
			}
		} else {
			for (const key of scheme[action]) {
				if (this.player.input.keyDown(key)) {
					return true
				}
			}
		}

		return false
	}
}
