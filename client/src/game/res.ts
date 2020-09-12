import { ResourcesLoader } from '@/lib/resources-loader'

const base = new ResourcesLoader()

if (process.env.NODE_ENV === 'production') {
	base.addPackage('assets', 'assets.zip')
	base.parallel = false
}

export const res = base
	// MODELS
	.addModel('player', 'models/player.glb')
	.addModel('level-point', 'models/level-point.glb')
	.addModel('level-honzik', 'models/level-honzik.glb')
