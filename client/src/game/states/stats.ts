export type StatsState = ReturnType<typeof defaultStatsState>

export const defaultStatsState = () => ({
	kills: 0,
	fired: 0,
	travelled: 0,
	lostHealth: 0,
	missed: 0,
	experience: 0
})
