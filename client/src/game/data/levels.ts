import { RoomType } from '@shared/exports'
import { keyMap } from '@shared/utils'
import { Object3D } from 'three'
import { World } from '../scenes/world'

export type LevelData = {
	type: RoomType
	model: (w: World) => Object3D
}

const item = (d: LevelData) => d

const list = [
	item({
		type: RoomType.Point,
		model: (w) => w.game.res.get('level-point').clone()
	}),
	item({
		type: RoomType.Honzik,
		model: (w) => w.game.res.get('level-honzik').clone()
	}),
	item({
		type: RoomType.Dorm,
		model: (w) => w.game.res.get('level-point').clone()
	})
]

export const Levels = keyMap(list, 'type')
