export enum ShadowsLevel {
	Disabled,
	Low,
	Medium,
	High
}

export enum Antialiasing {
	Disabled,
	Native
}

export const shadowMapMultiplier = {
	[ShadowsLevel.Disabled]: 0,
	[ShadowsLevel.Low]: 0.5,
	[ShadowsLevel.Medium]: 0.75,
	[ShadowsLevel.High]: 1
} as const

export const defaultSettingsState = () => ({
	resolution: 1,
	shadows: ShadowsLevel.Medium,
	antialiasing: Antialiasing.Disabled,
	postProcessing: true
})

export type SettingsData = ReturnType<typeof defaultSettingsState>

export type StoredSettings = {
	version: string
	data: SettingsData
}
