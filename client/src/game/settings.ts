import { SETTINGS_STORAGE_KEY, SETTINGS_VERSION } from './constants'
import {
	defaultSettingsState,
	StoredSettings,
	SettingsData
} from './states/settings'

export const loadSettings = () => {
	const storedData = localStorage[SETTINGS_STORAGE_KEY]
	let settings = defaultSettingsState()

	if (storedData) {
		try {
			const stored = JSON.parse(
				localStorage[SETTINGS_STORAGE_KEY]
			) as StoredSettings

			if (stored?.version !== SETTINGS_VERSION) {
				throw new Error(`Invalid version ${stored.version}`)
			}

			if (!stored?.data) {
				throw new Error('No settings data found')
			}

			settings = {
				...settings,
				...stored.data
			}
		} catch (e) {
			console.error('Failed to load settings from local storage', e)
		}
	}

	return settings
}

export const saveSettings = (settings: SettingsData) => {
	localStorage[SETTINGS_STORAGE_KEY] = JSON.stringify({
		version: SETTINGS_VERSION,
		data: settings
	} as StoredSettings)
}
