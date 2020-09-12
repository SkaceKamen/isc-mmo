export const setGlobal = <T>(name: string, value: T) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const anyWindow = window as any
	anyWindow[name] = value
}

export const requestAnimationFramePolyfill = () => {
	const vendors = ['ms', 'moz', 'webkit', 'o']
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const globalWindow = window as any

	for (
		let x = 0;
		x < vendors.length && !globalWindow.requestAnimationFrame;
		++x
	) {
		globalWindow.requestAnimationFrame =
			globalWindow[vendors[x] + 'RequestAnimationFrame']

		globalWindow.cancelAnimationFrame =
			globalWindow[vendors[x] + 'CancelAnimationFrame'] ||
			globalWindow[vendors[x] + 'CancelRequestAnimationFrame']
	}

	const frameTime = 1000 / 60

	if (!window.requestAnimationFrame) {
		let lastTime = 0

		window.requestAnimationFrame = function (callback) {
			const currTime = Date.now(),
				timeToCall = Math.max(0, frameTime - (currTime - lastTime))

			const id = window.setTimeout(function () {
				callback(currTime + timeToCall)
			}, timeToCall)

			lastTime = currTime + timeToCall

			return id
		}
	}

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id)
		}
	}
}
