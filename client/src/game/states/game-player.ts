export enum GamePlayerState {
	Playing,
	Respawning
}

export const defaultGamePlayerState = () => ({
	state: GamePlayerState.Respawning,
	respawn: 0
})
