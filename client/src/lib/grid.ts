import { Collider, ColliderLayer } from '@/game/collider'
import {
	Intersection,
	Object3D,
	Raycaster,
	Vector2,
	Vector3,
	Mesh,
	PlaneGeometry,
	MeshBasicMaterial
} from 'three'
import { AStarGraph, AStar } from './a-star'

export class Grid {
	position = new Vector3()
	size = new Vector2()

	cellSize = 2

	values = new Uint8ClampedArray()

	helper = new Object3D()

	graph?: AStarGraph
	pathFinder = new AStar()

	cache: Record<string, Vector3[]> = {}

	initialize(position: Vector3, size: Vector2, cellSize: number) {
		this.values = new Uint8ClampedArray(size.x * size.y)
		this.size = size
		this.cellSize = cellSize
		this.position.copy(position)
		this.helper.position.copy(this.position)
	}

	update(colliders: Collider[]) {
		const width = this.size.x
		const height = this.size.y

		const raycaster = new Raycaster()
		raycaster.layers.set(ColliderLayer.Collision)

		const position = new Vector3()
		const direction = new Vector3(0, 1, 0)

		const intersections = [] as Intersection[]

		console.time('building grid')

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				let free = true

				for (let xx = -0.5; free && xx <= 0.5; xx += 0.25) {
					for (let yy = -0.5; free && yy <= 0.5; yy += 0.25) {
						position.set(
							(x + xx) * this.cellSize,
							-10,
							(y + yy) * this.cellSize
						)

						raycaster.set(this.position.clone().add(position), direction)

						intersections.length = 0

						raycaster.intersectObjects(colliders, true, intersections)

						if (intersections.length > 0) {
							free = false
							break
						}
					}
				}

				/*
				const obj = new Mesh(
					new PlaneGeometry(0.2, 0.2),
					new MeshBasicMaterial({
						color: free ? 0x00ff00 : 0xff0000,
						wireframe: true
					})
				)

				obj.position.set(x * this.cellSize, 0.1, y * this.cellSize)

				obj.rotateX(-Math.PI / 2)
			

				this.helper.add(obj)
				*/

				this.values[y * width + x] = free ? 1 : 0
			}
		}

		this.graph = new AStarGraph(this.values, width, height, { diagonal: true })
		this.cache = {}

		console.timeEnd('building grid')
	}

	valueAt(x: number, y: number) {
		return this.values[y * this.size.y + x]
	}

	worldToNode(position: Vector3) {
		if (!this.graph) {
			throw new Error('Graph is not initialized yet')
		}

		const pos = position
			.clone()
			.sub(this.position)
			.divideScalar(this.cellSize)
			.round()

		if (
			pos.x < 0 ||
			pos.z < 0 ||
			pos.x >= this.size.x ||
			pos.z >= this.size.y
		) {
			throw new Error(`Position ${position} is out of bounds (${pos})`)
		}

		return this.graph?.grid[pos.x][pos.z]
	}

	nodeToWorld(node: { x: number; y: number }) {
		return new Vector3(node.x, 0, node.y)
			.multiplyScalar(this.cellSize)
			.add(this.position)
	}

	findPath(from: Vector3, to: Vector3) {
		if (!this.graph) {
			return []
		}

		const nodeFrom = this.worldToNode(from)
		const nodeTo = this.worldToNode(to)
		const cacheKey = `${nodeFrom.toString()}-${nodeTo.toString()}`

		if (this.cache[cacheKey]) {
			return this.cache[cacheKey]
		}

		const found = (this.cache[cacheKey] = this.pathFinder
			.search(this.graph, this.worldToNode(from), this.worldToNode(to))
			.map((n) => {
				if (n.isWall()) {
					throw new Error('Wall is part of the path')
				}

				return this.nodeToWorld(n)
			}))

		return found
	}
}
