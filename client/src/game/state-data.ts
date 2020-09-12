export class StateData<T> {
	private state: T
	private previousState?: T
	private isUpdated = false

	constructor(data: T) {
		this.state = data
	}

	clearUpdated() {
		this.isUpdated = false
	}

	set(state: Partial<T>) {
		this.previousState = this.state
		this.state = { ...this.state, ...state }
		this.isUpdated = true
	}

	setValue<K extends keyof T = keyof T>(name: K, value: T[K]) {
		if (this.state[name] !== value) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			this.set({ [name]: value } as any)
		}
	}

	get data() {
		return this.state
	}

	get previous() {
		return this.previousState
	}

	get updated() {
		return this.isUpdated
	}
}
