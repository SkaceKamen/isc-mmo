import { resolve } from 'path'
import { timeEnd } from 'console'

export async function wait(timeInMs: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, timeInMs))
}
