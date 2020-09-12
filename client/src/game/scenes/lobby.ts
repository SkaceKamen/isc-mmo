import Scene from '../scene'
import { LobbyUI } from '../objects/ui/lobby-ui'

export class Lobby extends Scene {
	start() {
		this.create(LobbyUI)
	}
}
