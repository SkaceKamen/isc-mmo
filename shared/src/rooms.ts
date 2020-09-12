import { keyMap } from './utils'

export enum RoomType {
	Point = 1,
	Honzik,
	Dorm
}

export type RoomData = {
	type: RoomType
	name: string
	unique: boolean
}

const item = (d: RoomData) => d

const list = [
	item({
		type: RoomType.Point,
		name: 'Point',
		unique: false
	}),
	item({
		type: RoomType.Honzik,
		name: 'Honzík',
		unique: false
	}),
	item({
		type: RoomType.Dorm,
		name: 'Dorm',
		unique: true
	})
]

export const Rooms = keyMap(list, 'type')
