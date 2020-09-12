/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Object3D,
	Mesh,
	SkinnedMesh,
	Bone,
	Vector3,
	Camera,
	Vector2
} from 'three'
import { Collider } from '@/game/collider'
import Screen from './zengine/screen'

export const findByName = (s: Object3D, name: string) => {
	try {
		return findObject(s, (i) => i.name === name)
	} catch (e) {
		const names = [] as string[]
		s.traverse((n) => names.push(n.name))

		console.error('Available names', names)

		throw new Error(`Failed to find ${name} object: ${e}`)
	}
}

export const findObject = (
	s: Object3D,
	condition: (i: Object3D) => boolean
) => {
	const found = tryFindObject(s, condition)

	if (!found) {
		throw new Error('Failed to find object')
	}

	return found
}

export const tryFindObject = (
	s: Object3D,
	condition: (i: Object3D) => boolean
) => {
	let found = undefined as Object3D | undefined

	s.traverse((i) => {
		if (condition(i)) {
			found = i
		}
	})

	return found
}

export const enableShadows = (s: Object3D, cast = true, receive = true) => {
	s.traverse((i) => {
		if (i instanceof Mesh && !(i instanceof Collider)) {
			i.castShadow = cast
			i.receiveShadow = receive
		}
	})
}

export const fixSkeleton = (s: Object3D, t: Object3D) => {
	t.traverse((i) => {
		if (i instanceof SkinnedMesh) {
			const source = findByName(s, i.name) as SkinnedMesh
			i.skeleton = source.skeleton.clone()

			i.skeleton.bones = i.skeleton.bones.map(
				(b) => findByName(t, b.name) as Bone
			)

			i.bindMatrix = source.bindMatrix.clone()
			i.bindMatrixInverse = source.bindMatrixInverse.clone()
		}
	})
}

/**
 * Generates array containing numbers between start and end (excluding).
 * @param start beginning number
 * @param end ending number (excluding)
 * @param step range step, defaults to 1
 */
export function range(start: number, end: number, step = 1) {
	const result = [] as number[]

	for (let i = start; i < end; i += step) {
		result.push(i)
	}

	return result
}

export type KeysMatching<T, V> = {
	[K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/**
 * Creates map from array using specified key.
 * @param collection array of items
 * @param key key to be used in the map
 */
export function keyMap<T, K extends KeysMatching<T, string | number>>(
	collection: T[],
	key: K,
	source = {} as Record<Extract<T[K], string | number | symbol>, T>
): Record<Extract<T[K], string | number | symbol>, T> {
	return collection.reduce((acc, item) => {
		acc[item[key] as Extract<T[K], string | number | symbol>] = item

		return acc
	}, source)
}

type KeyValueMapResult<T, F> = F extends (item: T, index: number) => infer R
	? R
	: F extends keyof T
	? T[F]
	: never

/**
 * Creates map from array using specified key and specified value key.
 * @param collection array of items
 * @param key key to be used in the map
 * @param valueKey key extracted from item
 */
export function keyValueMap<
	T,
	K1 extends KeysMatching<T, string | number>,
	VK extends keyof T | ((item: T, index: number) => any)
>(
	collection: T[],
	key: K1,
	valueKey: VK
): Record<string, KeyValueMapResult<T, VK>> {
	return collection.reduce((acc, item, index) => {
		// eslint-disable-next-line padding-line-between-statements
		;(acc as any)[item[key] as any] =
			typeof valueKey === 'function'
				? (valueKey as any)(item, index)
				: item[valueKey as keyof T]

		return acc
	}, {} as Record<string, KeyValueMapResult<T, VK>>)
}

export const weightedRandom = <T, K extends KeysMatching<T, number>>(
	items: T[],
	weightKey: K
) => {
	const sum = items.reduce(
		(acc, el) => acc + ((el[weightKey] as unknown) as number),
		0
	)

	const rand = Math.random() * sum
	let acc = 0

	for (let i = 0; i < items.length; i++) {
		acc += (items[i][weightKey] as unknown) as number

		if (acc >= rand) {
			return items[i]
		}
	}

	throw new Error('Failed ' + rand + ',' + acc)
}

export const dirVector = (direction: number, length: number) =>
	new Vector3(0, 0, length).applyAxisAngle(new Vector3(0, 1, 0), direction)

export const distance2D = (a: Vector3, b: Vector3) =>
	a.distanceTo(b.clone().setY(a.y))

export const cn = (
	...classes: (string | boolean | undefined | null | Record<string, boolean>)[]
) => {
	return classes
		.filter((v) => v !== null && v !== undefined && v !== false)
		.reduce(
			(acc, c) => [
				...acc,
				...(c && typeof c === 'object'
					? Object.entries(c)
							.filter(([, value]) => !!value)
							.map(([key]) => key)
					: typeof c === 'string'
					? [c]
					: [])
			],
			[] as string[]
		)
		.filter((c) => typeof c === 'string' && c.length > 0)
		.join(' ')
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export function shuffle<T>(a: T[]) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))

		;[a[i], a[j]] = [a[j], a[i]]
	}

	return a
}

export function countDuplicates<T extends { toString(): string }>(a: T[]) {
	const counts = a.reduce((acc, u) => {
		const k = u.toString()

		if (!acc[k]) {
			acc[k] = 1
		} else {
			acc[k]++
		}

		return acc
	}, {} as Record<string, number>)

	return Array.from(new Set(a)).map((item) => ({
		item,
		count: counts[item.toString()]
	}))
}

export const pickRandom = <A>(a: A[]) =>
	a[Math.round(Math.random() * (a.length - 1))]

export const worldToScreen = (
	camera: Camera,
	screen: Screen,
	position: Vector3
) => {
	const vector = position.clone().project(camera)

	vector.x = ((vector.x + 1) * screen.width) / 2
	vector.y = (-(vector.y - 1) * screen.height) / 2

	return vector
}
