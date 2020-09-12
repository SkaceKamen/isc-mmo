import { RoomType } from '@shared/rooms'
import { Room } from './room'

export class Game {
	idCounter = 1

	rooms = {
		[RoomType.Point]: new Room(this, RoomType.Point),
		[RoomType.Honzik]: new Room(this, RoomType.Honzik),
		[RoomType.Dorm]: new Room(this, RoomType.Dorm)
	} as Record<RoomType, Room>

	getNextId() {
		return this.idCounter++
	}
}
