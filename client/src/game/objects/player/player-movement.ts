import { PlayerComponent } from './player-component'
import { Raycaster, Vector3 } from 'three'
import { ColliderLayer } from '@/game/collider'

const raycaster = new Raycaster()

const moveRays = [
	new Vector3(-0.3, 0.3, 0),
	new Vector3(0, 0.3, 0),
	new Vector3(0.3, 0.3, 0)
]

export class PlayerMovement extends PlayerComponent {
	tick(delta: number) {
		// this.applyInputStraight(delta)

		this.applyFriction(delta)

		this.applyInput(delta)

		this.applyMove(delta)
	}

	applyInputStraight(delta: number) {
		this.state.velocity = this.state.input
			.clone()
			.multiplyScalar(this.state.speed)
	}

	applyInput(delta: number) {
		this.state.velocity.add(
			this.state.input.clone().multiplyScalar(this.state.acceleration * delta)
		)

		if (this.state.velocity.length() > this.state.speed) {
			this.state.velocity.normalize().multiplyScalar(this.state.speed)
		}

		if (this.state.input.lengthSq() > 0) {
			this.player.transform.lookAt(
				this.player.position.clone().add(this.player.state.input)
			)
		}
	}

	applyFriction(delta: number) {
		if (this.state.velocity.length() > this.state.friction * delta) {
			this.state.velocity.add(
				this.state.velocity
					.clone()
					.normalize()
					.multiplyScalar(-this.state.friction * delta)
			)
		} else {
			this.state.velocity.set(0, 0, 0)
		}
	}

	applyMove(delta: number) {
		if (this.state.velocity.lengthSq() > 0) {
			const move = this.state.velocity.clone().multiplyScalar(delta)
			let moveDistance = move.length()

			const position = new Vector3()
			this.player.transform.getWorldPosition(position)

			raycaster.layers.set(ColliderLayer.Collision)
			raycaster.layers.enable(ColliderLayer.Player)
			raycaster.far = moveDistance + 2

			moveRays.forEach((ray) => {
				raycaster.set(
					ray
						.clone()
						.applyQuaternion(this.player.rotation)
						.add(this.player.position),
					move
				)

				const intersects = raycaster.intersectObjects(
					this.player.world.colliders,
					true
				)

				if (intersects.length > 0) {
					for (let i = 0; i < intersects.length; i++) {
						if (intersects[i].object !== this.player.collider) {
							if (intersects[i].distance < moveDistance + 1) {
								moveDistance = Math.max(0, intersects[i].distance - 1)
							}
						}
					}
				}
			})

			this.player.position.add(move.normalize().multiplyScalar(moveDistance))

			this.player.game.updateStat('travelled', (v) => v + moveDistance)
		}
	}
}
