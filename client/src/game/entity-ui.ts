import { wait } from '@/lib/async'
import $c from '@/lib/creator2'
import { Hole, render } from 'lighterhtml'
import Entity from './entity'
import Scene from './scene'
import { World } from './scenes/world'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class EntityUI<State = any> extends Entity<State> {
	state?: State

	private lastState?: State

	protected container: HTMLDivElement

	protected mounted = false
	protected renderScheduled = true

	protected closeDelay = 200
	protected closeAnimation = 'fade-out'

	protected shallowCompare = true

	get world() {
		return this.scene as World
	}

	get game() {
		return this.world.game
	}

	constructor(scene: Scene) {
		super(scene)

		this.container = this.createContainer()
		document.body.appendChild(this.container)

		scene.onLeave.once(() => {
			if (!this.__removed) {
				this.container.remove()
			}
		})
	}

	createContainer() {
		return $c('div').css('ui-item').html()
	}

	tick(delta: number) {
		super.tick(delta)

		if (this.renderScheduled) {
			this.rerender()
		}
	}

	setState(state: Partial<State>) {
		this.state = { ...this.state, ...state } as State

		if (this.shallowCompare && this.state) {
			if (
				!this.lastState ||
				Object.keys(this.state).length !== Object.keys(this.lastState).length
			) {
				this.renderScheduled = true
			} else {
				for (const key of Object.keys(this.state)) {
					if (
						this.state[key as keyof State] !==
						this.lastState[key as keyof State]
					) {
						this.renderScheduled = true
						break
					}
				}
			}

			this.lastState = this.state
		} else {
			this.renderScheduled = true
		}

		if (this.renderScheduled && this.game.paused) {
			this.rerender()
		}
	}

	onMount() {}

	onRemove() {
		this.container.remove()
	}

	rerender() {
		render(this.container, this.render())

		this.renderScheduled = false

		if (!this.mounted) {
			this.mounted = true
			this.onMount()
		}
	}

	async close() {
		this.container.children[0].classList.add(this.closeAnimation)

		await wait(this.closeDelay)
		this.remove()
	}

	hide() {
		this.container.style.display = 'none'
	}

	show() {
		this.container.style.display = ''
	}

	toggle(display: boolean) {
		this.container.style.display = display ? '' : 'none'
	}

	serialize() {
		return { ...this.state } as State
	}

	deserialize(data: State) {
		this.state = data
	}

	abstract render(): Hole
}
