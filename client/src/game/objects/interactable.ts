import { Vector3 } from 'three'
import { Player } from './player'

export interface Interactable {
	prompt: string
	position: Vector3

	interact(by: Player, onDone: () => void): void
}
