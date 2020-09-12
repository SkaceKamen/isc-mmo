export default class ZipFilesPlugin {
	constructor(options: {
		entries: { src: string; dist: string }[]
		output: string
		format: 'tar' | 'zip'
	})
}
