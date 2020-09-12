export type PlayerAction = 'up' | 'left' | 'right' | 'down' | 'action'

export enum PlayerInputDevice {
	None,
	Keyboard1,
	Gamepad1
}

export type PlayerInputDeviceInfo = {
	gamepadIndex?: number
	scheme: Record<PlayerAction, string[]>
}

const item = (i: PlayerInputDeviceInfo) => i

export const inputDevices = {
	[PlayerInputDevice.None]: item({
		scheme: {
			up: [],
			left: [],
			right: [],
			down: [],
			action: []
		}
	}),
	[PlayerInputDevice.Gamepad1]: item({
		gamepadIndex: 0,
		scheme: {
			up: ['12'],
			left: ['14'],
			right: ['15'],
			down: ['13'],
			action: ['0']
		}
	}),
	[PlayerInputDevice.Keyboard1]: item({
		scheme: {
			up: ['KeyW', 'KeyUp'],
			left: ['KeyA', 'KeyLeft'],
			right: ['KeyD', 'KeyRight'],
			down: ['KeyS', 'KeyDown'],
			action: ['KeyE']
		}
	})
} as const
