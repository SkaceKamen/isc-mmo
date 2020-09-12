/* eslint-disable @typescript-eslint/no-explicit-any */
import { PROGRESS_STORAGE_KEY, PROGRESS_VERSION } from './constants'
import {
	defaultProgressState,
	ProgressData,
	StoredProgress
} from './states/progress'

type DataPatch = {
	from: string
	to: string
	apply: (d: any) => ProgressData
}

const patches = [
	{
		from: '1.0',
		to: '1.1',
		apply: (d) => ({ ...d, skipTutorial: false })
	}
] as DataPatch[]

export const loadProgress = () => {
	const storedData = localStorage[PROGRESS_STORAGE_KEY]
	let data = defaultProgressState()

	if (storedData) {
		try {
			const stored = JSON.parse(
				localStorage[PROGRESS_STORAGE_KEY]
			) as StoredProgress

			if (!stored?.data || !stored?.version) {
				delete localStorage[PROGRESS_STORAGE_KEY]
			}

			if (stored?.version !== PROGRESS_VERSION) {
				let version = stored?.version

				while (version !== PROGRESS_VERSION) {
					const patch = patches.find((p) => p.from === version)

					if (patch) {
						stored.data = patch.apply(stored.data)
						version = patch.to
					} else {
						throw new Error(`No patch found to upgrade from version ${version}`)
					}
				}
			}

			data = {
				...data,
				...stored.data
			}
		} catch (e) {
			console.error('Failed to load settings from local storage', e)
		}
	}

	return data
}

export const saveProgress = (progress: ProgressData) => {
	localStorage[PROGRESS_STORAGE_KEY] = JSON.stringify({
		version: PROGRESS_VERSION,
		data: progress
	} as StoredProgress)
}
