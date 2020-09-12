/* eslint-disable @typescript-eslint/no-explicit-any */
export const ucFirst = (value: string) =>
	value.charAt(0).toUpperCase() + value.slice(1)

/**
 * Removes control characters from input string
 * @param str
 */
export const sanitize = (str?: string) =>
	str ? str.trim().replace(/[\x00-\x1F\x7F-\x9F\u200f]/g, '') : str

/**
 * Returns length of string without special characters
 * @param str
 */
export const nonEmptyStringLength = (str?: string) =>
	str ? str.replace(/[\x00-\x08\x0E-\x1F\x7F-\uFFFF ]/g, '').length : 0

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

export const flatten = <T>(a: T[][]) =>
	a.reduce((acc, a) => [...acc, ...a], [] as T[])

type KeysMatching<T, V> = {
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		acc[item[key] as Extract<T[K], string | number | symbol>] = item

		return acc
	}, source)
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export function shuffle<T>(a: T[]) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
			// eslint-disable-next-line padding-line-between-statements
		;[a[i], a[j]] = [a[j], a[i]]
	}

	return a
}

export const voidReduce = <T, R>(
	array: T[],
	accumulator: R,
	callback: (accumulator: R, item: T, index: number) => any
) => {
	return array.reduce((acc, item, index) => {
		callback(acc, item, index)

		return acc
	}, accumulator)
}

export const voidReduceRight = <T, R>(
	array: T[],
	accumulator: R,
	callback: (accumulator: R, item: T, index: number) => any
) => {
	return array.reduceRight((acc, item, index) => {
		callback(acc, item, index)

		return acc
	}, accumulator)
}

export const mapRight = <T, R>(
	array: T[],
	callback: (item: T, index: number) => R
): R[] =>
	voidReduceRight(array, [] as R[], (acc, item, index) =>
		acc.push(callback(item, index))
	)
