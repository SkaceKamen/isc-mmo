/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from '@/lib/zengine'
import { Player } from '../player'

export class PlayerComponent extends Component {
	get player() {
		return this.entity as Player
	}

	get state() {
		return this.player.state
	}

	start() {}
	tick(_delta: number) {}
}
