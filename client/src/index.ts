import * as _THREE from 'three'
import './styles/index.less'
import './lib/debug/style.less'

// Hack for third-party libs
window['THREE'] = _THREE

import { Game } from './game/game'
import { Keys } from '@/lib/zengine'
import { Debugger } from './lib/debug/debug'

const game = new Game()
export const info = {
	game
}

window.onload = () => {
	let debug: Debugger | undefined

	window.addEventListener('keydown', (e: KeyboardEvent) => {
		if (!debug) {
			if (e.keyCode === Keys.F2) {
				game.paused = true

				debug = new Debugger()
				debug.assign(game)

				debug.onClose.on(() => (debug = undefined))

				// eslint-disable-next-line @typescript-eslint/no-explicit-any, padding-line-between-statements
				;(window as any)['dbg'] = debug
			}
		}
	})
}
