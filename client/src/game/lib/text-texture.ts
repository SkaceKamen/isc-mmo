import { Texture, LinearFilter, ClampToEdgeWrapping, Vector2 } from 'three'

const defaultOptions = {
	text: '',
	size: 10,
	font: 'Arial',
	style: 'bold',
	color: 'black',
	drawSize: new Vector2(512, 512)
}

export type TextTextureOptions = typeof defaultOptions

export class TextTexture extends Texture {
	canvas: HTMLCanvasElement

	options: TextTextureOptions

	constructor(options = {} as Partial<TextTextureOptions>) {
		super()

		this.options = {
			...defaultOptions,
			...options
		}

		this.minFilter = LinearFilter
		this.wrapS = ClampToEdgeWrapping
		this.wrapT = ClampToEdgeWrapping

		this.canvas = document.createElement('canvas')
		this.redraw()
	}

	update(options = {} as Partial<TextTextureOptions>) {
		this.options = {
			...this.options,
			...options
		}

		this.redraw()
	}

	private redraw() {
		const { size, style, font, drawSize, text, color } = this.options

		const ctx = this.canvas.getContext('2d')

		if (!ctx) {
			throw new Error('Failed to get 2d drawing context')
		}

		const fontStyle = `${style} ${size}px ${font}`
		ctx.font = fontStyle

		ctx.canvas.width = drawSize.x
		ctx.canvas.height = drawSize.y

		// need to set font again after resizing canvas
		ctx.font = fontStyle
		ctx.textBaseline = 'middle'
		ctx.textAlign = 'center'

		const width = ctx.measureText(text).width

		ctx.translate(drawSize.x / 2, drawSize.y / 2)
		ctx.scale(drawSize.x / width, drawSize.x / width)

		ctx.fillStyle = color
		ctx.fillText(text, 0, 0)

		this.image = ctx.canvas
		this.needsUpdate = true
	}
}
