import { keyValueMap } from '@/lib/utils'
import {
	AnimationAction,
	AnimationActionLoopStyles,
	AnimationClip,
	AnimationMixer,
	Object3D
} from 'three'

export class AnimationContainer {
	protected animations = {} as Record<string, AnimationAction>
	protected lastAnimations = [] as AnimationAction[]
	protected player = new AnimationMixer(new Object3D())

	initialize(root: Object3D, animations: AnimationClip[]) {
		this.player = new AnimationMixer(root)

		this.animations = keyValueMap(animations, 'name', (i) =>
			this.player.clipAction(i)
		)
	}

	setLoop(
		name: string,
		loop: AnimationActionLoopStyles,
		repetitions = Infinity
	) {
		this.find(name).forEach((a) => {
			a.setLoop(loop, repetitions)
		})
	}

	setClamp(name: string, clamp: boolean) {
		this.find(name).forEach((a) => {
			a.clampWhenFinished = clamp
		})
	}

	setDuration(name: string, duration: number) {
		this.find(name).forEach((a) => {
			a.setEffectiveTimeScale(a.getClip().duration / duration)
		})
	}

	find(name: string) {
		const anim = Object.keys(this.animations)
			.filter((k) => k.indexOf(name) === 0)
			.map((k) => this.animations[k])

		return anim
	}

	play(name: string, fade = 0.2) {
		const anim = this.find(name)

		this.lastAnimations.forEach((a) => {
			a.fadeOut(fade)
		})

		anim.forEach((a) => {
			a.fadeIn(fade)
			a.stop()
			a.play()
		})

		this.lastAnimations = anim

		return anim
	}

	tick(delta: number) {
		this.player.update(delta)
	}
}
