export const defaultProgressState = () => ({})

export type ProgressData = ReturnType<typeof defaultProgressState>

export type StoredProgress = {
	version: string
	data: ProgressData
}
