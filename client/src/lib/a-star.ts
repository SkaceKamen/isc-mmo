// javascript-astar 0.3.0
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

function pathTo(node: GridNode) {
	let curr = node
	const path = []

	while (curr.parent) {
		path.push(curr)
		curr = curr.parent
	}

	return path.reverse()
}

function getHeap() {
	return new BinaryHeap<GridNode>((node) => node.f)
}

export class AStar {
	/**
	 * Perform an A* Search on a graph given a start and end node.
	 */
	search(
		graph: AStarGraph,
		start: GridNode,
		end: GridNode,
		options?: {
			closest?: boolean
			heuristic?: (a: GridNode, b: GridNode) => number
		}
	) {
		graph.clearDirty()

		options = options || {}

		const heuristic = options.heuristic || AStar.heuristics.manhattan,
			closest = options.closest || false

		const openHeap = getHeap()
		let closestNode = start // set the start node to be the closest if required

		start.h = heuristic(start, end)
		graph.markDirty(start)

		openHeap.push(start)

		while (openHeap.size() > 0) {
			// Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
			const currentNode = openHeap.pop()

			// End case -- result has been found, return the traced path.
			if (currentNode === end) {
				return pathTo(currentNode)
			}

			// Normal case -- move currentNode from open to closed, process each of its neighbors.
			currentNode.closed = true

			// Find all neighbors for the current node.
			const neighbors = graph.neighbors(currentNode)

			for (let i = 0, il = neighbors.length; i < il; ++i) {
				const neighbor = neighbors[i]

				if (neighbor.closed || neighbor.isWall()) {
					// Not a valid node to process, skip to next neighbor.
					continue
				}

				// The g score is the shortest distance from start to current node.
				// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
				const gScore = currentNode.g + neighbor.getCost(currentNode),
					beenVisited = neighbor.visited

				if (!beenVisited || gScore < neighbor.g) {
					// Found an optimal (so far) path to this node.  Take score for node to see how good it is.
					neighbor.visited = true
					neighbor.parent = currentNode
					neighbor.h = neighbor.h || heuristic(neighbor, end)
					neighbor.g = gScore
					neighbor.f = neighbor.g + neighbor.h
					graph.markDirty(neighbor)

					if (closest) {
						// If the neighbor is closer than the current closestNode or if it's equally close but has
						// a cheaper path than the current closest node then it becomes the closest node
						if (
							neighbor.h < closestNode.h ||
							(neighbor.h === closestNode.h && neighbor.g < closestNode.g)
						) {
							closestNode = neighbor
						}
					}

					if (!beenVisited) {
						// Pushing to heap will put it in proper place based on the 'f' value.
						openHeap.push(neighbor)
					} else {
						// Already seen the node, but since it has been rescored we need to reorder it in the heap
						openHeap.rescoreElement(neighbor)
					}
				}
			}
		}

		if (closest) {
			return pathTo(closestNode)
		}

		// No result was found - empty array signifies failure to find path.
		return []
	}

	// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
	static heuristics = {
		manhattan: function (pos0: GridNode, pos1: GridNode) {
			const d1 = Math.abs(pos1.x - pos0.x)
			const d2 = Math.abs(pos1.y - pos0.y)

			return d1 + d2
		},
		diagonal: function (pos0: GridNode, pos1: GridNode) {
			const D = 1
			const D2 = Math.sqrt(2)
			const d1 = Math.abs(pos1.x - pos0.x)
			const d2 = Math.abs(pos1.y - pos0.y)

			return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2)
		}
	}
}

/**
 * A graph memory structure
 */
export class AStarGraph {
	nodes = [] as GridNode[]
	grid = [] as GridNode[][]
	dirtyNodes = [] as GridNode[]

	diagonal = false

	constructor(
		gridIn: Uint8ClampedArray,
		width: number,
		height: number,
		options?: { diagonal?: boolean }
	) {
		options = options || {}
		this.nodes = []
		this.diagonal = !!options.diagonal
		this.grid = []

		for (let x = 0; x < width; x++) {
			this.grid[x] = []

			for (let y = 0; y < height; y++) {
				const node = new GridNode(x, y, gridIn[y * width + x])
				this.grid[x][y] = node
				this.nodes.push(node)
			}
		}
	}

	clearDirty() {
		for (let i = 0; i < this.dirtyNodes.length; i++) {
			this.dirtyNodes[i].clear()
		}

		this.dirtyNodes = []
	}

	markDirty(node: GridNode) {
		this.dirtyNodes.push(node)
	}

	neighbors(node: GridNode) {
		const ret = [],
			x = node.x,
			y = node.y,
			grid = this.grid

		// West
		if (grid[x - 1] && grid[x - 1][y]) {
			ret.push(grid[x - 1][y])
		}

		// East
		if (grid[x + 1] && grid[x + 1][y]) {
			ret.push(grid[x + 1][y])
		}

		// South
		if (grid[x] && grid[x][y - 1]) {
			ret.push(grid[x][y - 1])
		}

		// North
		if (grid[x] && grid[x][y + 1]) {
			ret.push(grid[x][y + 1])
		}

		if (this.diagonal) {
			// Southwest
			if (grid[x - 1] && grid[x - 1][y - 1]) {
				ret.push(grid[x - 1][y - 1])
			}

			// Southeast
			if (grid[x + 1] && grid[x + 1][y - 1]) {
				ret.push(grid[x + 1][y - 1])
			}

			// Northwest
			if (grid[x - 1] && grid[x - 1][y + 1]) {
				ret.push(grid[x - 1][y + 1])
			}

			// Northeast
			if (grid[x + 1] && grid[x + 1][y + 1]) {
				ret.push(grid[x + 1][y + 1])
			}
		}

		return ret
	}

	toString() {
		const graphString = []
		const nodes = this.grid // when using grid
		let rowDebug, row, y, l

		for (let x = 0, len = nodes.length; x < len; x++) {
			rowDebug = []
			row = nodes[x]

			for (y = 0, l = row.length; y < l; y++) {
				rowDebug.push(row[y].weight)
			}

			graphString.push(rowDebug.join(' '))
		}

		return graphString.join('\n')
	}
}

class GridNode {
	x: number
	y: number
	weight: number

	closed = false
	visited = false
	parent = null as GridNode | null

	h = 0
	f = 0
	g = 0

	constructor(x: number, y: number, weight: number) {
		this.x = x
		this.y = y
		this.weight = weight
		this.clear()
	}

	clear() {
		this.f = 0
		this.g = 0
		this.h = 0
		this.visited = false
		this.closed = false
		this.parent = null
	}

	toString() {
		return '[' + this.x + ' ' + this.y + ']'
	}

	getCost(fromNeighbor: GridNode) {
		if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
			return this.weight * 1.41421
		}

		return this.weight
	}

	isWall() {
		return this.weight === 0
	}
}

class BinaryHeap<T> {
	content: T[]

	scoreFunction: (n: T) => number

	constructor(scoreFunction: (n: T) => number) {
		this.content = []
		this.scoreFunction = scoreFunction
	}

	push(element: T) {
		// Add the new element to the end of the array.
		this.content.push(element)

		// Allow it to sink down.
		this.sinkDown(this.content.length - 1)
	}

	pop() {
		// Store the first element so we can return it later.
		const result = this.content[0]
		// Get the element at the end of the array.
		const end = this.content.pop()

		// If there are any elements left, put the end element at the
		// start, and let it bubble up.
		if (end !== undefined && this.content.length > 0) {
			this.content[0] = end
			this.bubbleUp(0)
		}

		return result
	}

	remove(node: T) {
		const i = this.content.indexOf(node)

		// When it is found, the process seen in 'pop' is repeated
		// to fill up the hole.
		const end = this.content.pop()

		if (end !== undefined && i !== this.content.length - 1) {
			this.content[i] = end

			if (this.scoreFunction(end) < this.scoreFunction(node)) {
				this.sinkDown(i)
			} else {
				this.bubbleUp(i)
			}
		}
	}

	size() {
		return this.content.length
	}

	rescoreElement(node: T) {
		this.sinkDown(this.content.indexOf(node))
	}

	sinkDown(n: number) {
		// Fetch the element that has to be sunk.
		const element = this.content[n]

		// When at 0, an element can not sink any further.
		while (n > 0) {
			// Compute the parent element's index, and fetch it.
			const parentN = ((n + 1) >> 1) - 1,
				parent = this.content[parentN]

			// Swap the elements if the parent is greater.
			if (this.scoreFunction(element) < this.scoreFunction(parent)) {
				this.content[parentN] = element
				this.content[n] = parent
				// Update 'n' to continue at the new position.
				n = parentN
			}
			// Found a parent that is less, no need to sink any further.
			else {
				break
			}
		}
	}

	bubbleUp(n: number) {
		// Look up the target element and its score.
		const length = this.content.length,
			element = this.content[n],
			elemScore = this.scoreFunction(element)

		while (true) {
			// Compute the indices of the child elements.
			const child2N = (n + 1) << 1,
				child1N = child2N - 1

			// This is used to store the new position of the element, if any.
			let swap = null,
				child1Score = 0

			// If the first child exists (is inside the array)...
			if (child1N < length) {
				// Look it up and compute its score.
				const child1 = this.content[child1N]
				child1Score = this.scoreFunction(child1)

				// If the score is less than our element's, we need to swap.
				if (child1Score < elemScore) {
					swap = child1N
				}
			}

			// Do the same checks for the other child.
			if (child2N < length) {
				const child2 = this.content[child2N],
					child2Score = this.scoreFunction(child2)

				if (child2Score < (swap === null ? elemScore : child1Score)) {
					swap = child2N
				}
			}

			// If the element needs to be moved, swap it, and continue.
			if (swap !== null) {
				this.content[n] = this.content[swap]
				this.content[swap] = element
				n = swap
			}
			// Otherwise, we are done.
			else {
				break
			}
		}
	}
}
