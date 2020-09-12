import { ZGame } from './game'
import { Eventor } from './eventor'

export interface ScreenSize {
	width: number
	height: number
}

export class Screen {
	width: number
	height: number

	onResize = new Eventor<ScreenSize>()

	constructor(public game: ZGame, public window: Window) {
		const size = this.viewport()

		this.width = size.width
		this.height = size.height

		window.addEventListener('resize', () => this.resized(), false)
	}

	protected resized() {
		const size = this.viewport()

		this.width = size.width
		this.height = size.height

		this.onResize.trigger(size)
	}

	viewport() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let e: any = this.window
		let a = 'inner'

		if (!('innerWidth' in window)) {
			a = 'client'
			e = window.document.documentElement || window.document.body
		}

		return <ScreenSize>{
			width: <number>e[a + 'Width'],
			height: <number>e[a + 'Height'],
		}
	}
}

export default Screen
