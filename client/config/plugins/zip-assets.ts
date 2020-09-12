/* eslint-disable @typescript-eslint/no-explicit-any */
import JSZip from 'jszip'
import glob from 'glob'
import {
	readFileSync,
	writeFileSync,
	existsSync,
	mkdirSync,
	lstatSync
} from 'fs'
import { dirname } from 'path'

export type ZipAssetsPluginOptions = {
	assets: {
		src: string
		dst?: string
	}[]
	dst: string
}

const asyncGlob = (pattern: string) =>
	new Promise<string[]>((resolve, reject) => {
		glob(pattern, (err, matches) => {
			if (err) {
				return reject(err)
			}

			resolve(matches)
		})
	})

export class ZipAssetsPlugin {
	private options: ZipAssetsPluginOptions

	constructor(options: ZipAssetsPluginOptions) {
		this.options = options
	}

	log(...data: any[]) {
		console.log('[Assets]', ...data)
	}

	done = async (_stats: any, callback = () => null) => {
		const zip = new JSZip()

		await Promise.all(
			this.options.assets.map(async (asset) => {
				this.log('Bundling assets from', asset.src)

				const base = dirname(asset.src)
				const matches = await asyncGlob(asset.src)

				matches.forEach((filename) => {
					if (lstatSync(filename).isFile()) {
						zip.file(
							(asset.dst ? asset.dst + '/' : '') +
								filename.substr(base.length + 1),
							readFileSync(filename)
						)
					}
				})
			})
		)

		const data = await zip.generateAsync({
			type: 'nodebuffer',
			compression: 'DEFLATE',
			compressionOptions: { level: 9 }
		})

		const dir = dirname(this.options.dst)

		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true })
		}

		writeFileSync(this.options.dst, data)

		this.log('Built bundle', this.options.dst)

		callback()
	}

	apply(compiler: any) {
		compiler.hooks.done.tapAsync('zip-models', this.done)
	}
}
