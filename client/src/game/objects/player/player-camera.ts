import { PlayerComponent } from './player-component'
import { Vector3 } from 'three'

export class PlayerCamera extends PlayerComponent {
	offset = new Vector3(3, 8, 0)

	tick(delta: number) {
		super.tick(delta)

		const camera = this.player.scene.camera
		const target = this.player.position.clone().add(this.offset)
		camera.position.lerp(target, delta * 10)

		camera.lookAt(
			camera.position.clone().add(this.offset.clone().multiplyScalar(-1))
		)
	}
}
