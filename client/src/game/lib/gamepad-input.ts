import { Component } from '@/lib/zengine'

export class GamepadInput extends Component {
	index = 0

	setIndex(index: number) {
		this.index = index
	}

	isPressed(index: number) {
		return navigator.getGamepads()[this.index]?.buttons[index]?.pressed === true
	}
}
