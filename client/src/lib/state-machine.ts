/* eslint-disable @typescript-eslint/no-unused-vars */
export class StateMachine<Name extends string | number> {
	private states = [] as State<Name>[]
	private dictionary = {} as Record<Name, State<Name>>

	currentState?: State<Name>

	debug = false

	addState(state: State<Name>) {
		this.states.push(state)

		if (state.name !== undefined) {
			this.dictionary[state.name] = state
		}

		return this
	}

	protected shouldSwitchState(delta: number): Name | undefined {
		return this.currentState?.transition(delta)
	}

	tick(delta: number) {
		const newState = this.shouldSwitchState(delta)

		if (newState !== undefined) {
			this.setState(newState)
		}

		this.currentState?.tick(delta)
	}

	setState(name: Name) {
		const old = this.currentState
		const newState = this.findState(name)

		if (this.debug) {
			console.log(old, '->', newState)
		}

		if (old === newState) {
			return this
		}

		if (old !== undefined) {
			this.onStateLeave(old, newState)
		}

		this.currentState = newState

		this.onStateEnter(old, this.currentState)

		return this
	}

	findState(name: Name) {
		const result = this.dictionary[name]

		if (result === undefined) {
			throw new Error(`Unknown state ${name}`)
		}

		return result
	}

	protected onStateLeave(state: State<Name>, nextState: State<Name>) {
		state.onLeave(nextState)
	}

	protected onStateEnter(
		prevState: State<Name> | undefined,
		newState: State<Name>
	) {
		newState.onEnter(prevState)
	}
}

export abstract class State<Name extends string | number> {
	readonly name?: Name

	onEnter(_prevState?: State<Name>) {}

	transition(_delta: number): Name | undefined {
		return undefined
	}

	tick(_delta: number) {}

	onLeave(_nextState: State<Name>) {}
}
