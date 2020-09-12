import {
	BufferAttribute,
	BufferGeometry,
	Color,
	Points,
	PointsMaterial,
	Texture,
	Vector3
} from 'three'
import Entity3D from '../entity3d'

export class Range {
	constructor(public from: number, public to: number) {}

	get(generator?: () => number): number {
		generator = generator || Math.random

		return this.from + generator() * (this.to - this.from)
	}
}

export class Range3 {
	x: Range
	y: Range
	z: Range

	constructor(
		xf: number,
		xt: number,
		yf: number,
		yt: number,
		zf: number,
		zt: number
	) {
		this.x = new Range(xf, xt)
		this.y = new Range(yf, yt)
		this.z = new Range(zf, zt)
	}

	get(generator?: () => number) {
		generator = generator || Math.random

		return {
			x: this.x.get(generator),
			y: this.y.get(generator),
			z: this.z.get(generator)
		}
	}
}

const defaultOptions = {
	texture: null as Texture | null,
	color: new Color(0xffffff),
	count: 0,
	gravity: 0,
	floor: 0,
	bounce: false,
	bounceFriction: 0.8,
	bounceRandomness: 0.5,
	timeOpacity: false,
	life: 10,
	spawnRadius: new Range3(0, 0, 0, 0, 0, 0),
	spawnDirection: new Range3(-1, 1, -1, 1, -1, 1),
	spawnVelocity: new Range(5, 8),
	size: 5,
	sizeAttenuation: true
}

export type Options = typeof defaultOptions

export class Particles extends Entity3D {
	options?: Options

	positions: Float32Array = new Float32Array()
	velocities: Vector3[] = []

	geometry?: BufferGeometry
	material?: PointsMaterial

	container?: Points

	time = 0

	initialize(options: Partial<Options>) {
		this.options = {
			...defaultOptions,
			...options
		}

		this.positions = new Float32Array(this.options.count * 3)

		for (let i = 0; i < this.options.count; i++) {
			const position = this.options.spawnRadius.get()
			const rotation = this.options.spawnDirection.get()

			this.positions[i * 3] = position.x
			this.positions[i * 3 + 1] = position.y
			this.positions[i * 3 + 2] = position.z

			this.velocities.push(
				new Vector3(rotation.x, rotation.y, rotation.z)
					.normalize()
					.multiplyScalar(this.options.spawnVelocity.get())
			)
		}

		this.geometry = new BufferGeometry()

		this.geometry.setAttribute(
			'position',
			new BufferAttribute(this.positions, 3)
		)

		this.material = new PointsMaterial({
			map: this.options.texture,
			color: this.options.color,
			size: this.options.size,
			sizeAttenuation: this.options.sizeAttenuation,
			transparent: true,
			alphaTest: 0.5
		})

		this.container = new Points(this.geometry, this.material)

		this.transform.add(this.container)
	}

	tick(delta: number) {
		if (!this.options || !this.material || !this.geometry) {
			return
		}

		this.time += delta

		if (this.time > this.options.life) {
			return this.remove()
		}

		if (this.options.timeOpacity) {
			this.material.opacity = 1 - this.time / this.options.life
		}

		for (let i = 0; i < this.options.count; i++) {
			// Load info about point
			const velocity = this.velocities[i]

			const position = new Vector3()
				.fromArray(this.positions, i * 3)
				.add(velocity.clone().multiplyScalar(delta))

			let gravity = this.options.gravity

			// Stop on floor
			if (position.y < this.options.floor - this.position.y) {
				position.y = this.options.floor - this.position.y

				if (!this.options.bounce) {
					velocity.set(0, 0, 0)
				} else {
					const friction =
						this.options.bounceFriction *
						(1 -
							this.options.bounceRandomness / 2 +
							this.options.bounceRandomness * Math.random())

					velocity.y = velocity.y * -friction
					velocity.x = velocity.x * friction
					velocity.z = velocity.z * friction

					if (velocity.y === 0) {
						velocity.set(0, 0, 0)
					}
				}

				gravity = 0
			}

			// Apply velocity friction
			velocity.multiplyScalar(1 - 0.1 * delta)

			// Add gravity to velocity
			velocity.y -= gravity * delta

			// Apply position
			this.positions[i * 3] = position.x
			this.positions[i * 3 + 1] = position.y
			this.positions[i * 3 + 2] = position.z

			this.geometry.attributes.position.setXYZ(
				i,
				position.x,
				position.y,
				position.z
			)

			const castedPosition = this.geometry.attributes
				.position as BufferAttribute

			castedPosition.needsUpdate = true
		}
	}
}

export default Particles
