import { Texture, RGBFormat, RGBAFormat } from 'three'

export class ImageDataLoader {
	parse(data: ArrayBuffer, fileName?: string) {
		return new Promise<Texture>((resolve, reject) => {
			const image = document.createElement('img')

			image.addEventListener('load', () => {
				const isJPEG =
					fileName &&
					(fileName.search(/\.jpe?g($|\?)/i) > 0 ||
						fileName.search(/^data\:image\/jpeg/) === 0)

				const texture = new Texture()
				texture.image = image
				texture.format = isJPEG ? RGBFormat : RGBAFormat
				texture.needsUpdate = true

				resolve(texture)
			})

			image.addEventListener('error', (e) => reject(e))

			image.src = URL.createObjectURL(new Blob([data]))
		})
	}
}
