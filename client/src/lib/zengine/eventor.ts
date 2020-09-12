type EventorCallback<T> = (value: T) => void
type OnceCallback<T> = (value: T) => void | false

/**
 * Simple class for events
 */
export class Eventor<T = void> {
	listeners = [] as EventorCallback<T>[]

	on(callback: EventorCallback<T>) {
		this.listeners.push(callback)
	}

	off(callback: EventorCallback<T>) {
		const index = this.listeners.indexOf(callback)

		if (index >= 0) {
			this.listeners.splice(index, 1)
		}
	}

	once(callback: OnceCallback<T>) {
		const cb = (a: T) => {
			if (callback(a) !== false) {
				this.off(cb)
			}
		}

		this.on(cb)
	}

	trigger(value: T) {
		this.listeners.slice().forEach((listener) => {
			listener.apply(listener, [value])
		})
	}
}

export default Eventor
