import { RoomType } from './rooms'
import { NetPlayerState } from './types'

export enum NetMessageCode {
	Hello = 1,
	Hi,
	Login,
	LoggedIn,
	NewPlayer,
	PlayerState,
	RemovePlayer,
	MyState,
	MoveToRoom,
	RequestMove
}

export const helloMessage = () =>
	({
		type: NetMessageCode.Hello
	} as const)

export const hiMessage = () =>
	({
		type: NetMessageCode.Hi
	} as const)

export const loginMessage = (name: string) =>
	({
		type: NetMessageCode.Login,
		name
	} as const)

export const loggedInMessage = () =>
	({
		type: NetMessageCode.LoggedIn
	} as const)

export const newPlayerMessage = (id: number, name: string) =>
	({
		type: NetMessageCode.NewPlayer,
		id,
		name
	} as const)

export const playerStateMessage = (id: number, state: NetPlayerState) =>
	({
		type: NetMessageCode.PlayerState,
		id,
		state
	} as const)

export const removePlayerMessage = (id: number) =>
	({
		type: NetMessageCode.RemovePlayer,
		id
	} as const)

export const myStateMessage = (state: NetPlayerState) =>
	({
		type: NetMessageCode.MyState,
		state
	} as const)

export const moveToRoom = (room: RoomType) =>
	({
		type: NetMessageCode.MoveToRoom,
		room
	} as const)

export const requestMove = (room: RoomType) =>
	({
		type: NetMessageCode.RequestMove,
		room
	} as const)

export type NetMessage =
	| ReturnType<typeof hiMessage>
	| ReturnType<typeof helloMessage>
	| ReturnType<typeof loginMessage>
	| ReturnType<typeof loggedInMessage>
	| ReturnType<typeof newPlayerMessage>
	| ReturnType<typeof playerStateMessage>
	| ReturnType<typeof removePlayerMessage>
	| ReturnType<typeof myStateMessage>
	| ReturnType<typeof moveToRoom>
	| ReturnType<typeof requestMove>
