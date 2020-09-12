import { enableShadows, findByName } from '@/lib/utils'
import { Eventor, InputComponent } from '@/lib/zengine'
import { Mesh, Vector3 } from 'three'
import { inputDevices, PlayerInputDevice } from '../data/devices'
import Entity3D from '../entity3d'
import { PlayerOptions } from '../game'
import { GamepadInput } from '../lib/gamepad-input'
import { Interactable } from './interactable'
import { PlayerCamera } from './player/player-camera'
import { PlayerInput } from './player/player-input'
import { PlayerInteractables } from './player/player-interactables'
import { PlayerMovement } from './player/player-movement'

export class Player extends Entity3D {
	input = this.addComponent(InputComponent)
	controls = this.addComponent(PlayerInput)
	movement = this.addComponent(PlayerMovement)
	gamepad = this.addComponent(GamepadInput)
	camera = this.addComponent(PlayerCamera)
	interactables = this.addComponent(PlayerInteractables)

	state = {
		remote: false,
		acceleration: 100,
		deAcceleration: 150,
		speed: 10,
		input: new Vector3(),
		velocity: new Vector3(),
		device: PlayerInputDevice.Keyboard1,
		interactable: undefined as Interactable | undefined,
		interacting: false
	}

	onDeath = new Eventor<Player>()
	onKill = new Eventor<Player>()

	start() {
		const model = this.game.res.get('player').clone()

		const collider = findByName(model, 'Collider') as Mesh

		/*
		this.collider = new Collider(this, collider.geometry, [
			ColliderLayer.Player
		])

		this.collider.position.copy(collider.position)
		
		collider.parent?.add(this.collider)
		*/

		collider.parent?.remove(collider)

		enableShadows(model, true, false)

		this.transform.add(model)
	}

	options(options: PlayerOptions, remote = false) {
		this.state.device = options.device

		const device = inputDevices[this.state.device]

		if (device.gamepadIndex !== undefined) {
			this.gamepad.index = device.gamepadIndex
		}

		this.state.remote = remote

		return this
	}

	tick(delta: number) {
		super.tick(delta)

		if (!this.state.remote) {
			this.game.mouse.x = this.input.mouse.x
			this.game.mouse.y = this.input.mouse.y

			this.camera.tick(delta)
			this.controls.tick()
			this.input.tick()
			this.interactables.tick()
		}

		this.movement.tick(delta)
	}

	hit() {
		// TODO: Something should happen here
	}
}
