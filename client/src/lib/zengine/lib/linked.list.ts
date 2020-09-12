export class LinkedList<T extends LinkedListItem> {
	protected static idCounter = 0

	id: number
	length = 0
	iter: Iterator<T>

	protected start?: InternalItem<T>
	protected end?: InternalItem<T>

	constructor() {
		this.id = LinkedList.idCounter++
		this.iter = new Iterator<T>(this)
	}

	/**
	 * Checks if this list is empty.
	 */
	empty() {
		return this.length == 0
	}

	/**
	 * Pushes new item to end of list
	 *
	 * @param var content
	 * @return object list item, used for operation such as removing
	 */
	push(obj: T) {
		const item: InternalItem<T> = {
			content: obj
		}

		if (!obj.__llReferences) {
			obj.__llReferences = {}
		}

		obj.__llReferences[this.id] = item

		if (!this.start) {
			this.start = item
		}

		if (!this.end) {
			this.end = item
		} else {
			this.end.next = item
			item.previous = this.end
			item.next = undefined
			this.end = item
		}

		this.length++

		return item
	}

	/**
	 * Pops item from start
	 * @return object popped content
	 */
	pop() {
		if (!this.start) {
			return undefined
		}

		const content = this.start.content
		this.remove(this.start.content)

		return content
	}

	/**
	 * Inserts content after specified item
	 *
	 * @param object after item to be inserted after
	 * @param var    obj   content to be inserted
	 * @return object list item
	 */
	insert(after: T | null, obj: T) {
		const item: InternalItem<T> = {
			content: obj
		}

		let af: InternalItem<T> | undefined = undefined

		if (!obj.__llReferences) {
			obj.__llReferences = {}
		}

		obj.__llReferences[this.id] = item

		if (after) {
			if (!after.__llReferences) {
				after.__llReferences = {}
			}

			af = after.__llReferences[this.id] as InternalItem<T> | undefined
		}

		item.previous = af
		item.next = af?.next

		this.length++

		// Insert at beginning
		if (after === null) {
			item.next = this.start

			if (this.start) {
				this.start.previous = item
			}

			this.start = item

			if (!this.end) {
				this.end = this.start
			}

			return item
		}

		if (af) {
			//Update back reference
			if (af.next) {
				af.next.previous = item
			}

			//Update next reference
			af.next = item
		}

		//Update ending reference
		if (af === this.end) {
			this.end = item
		}

		return item
	}

	/**
	 * Removes specified item from list
	 *
	 * @param object
	 * @return boolean true if item was removed, false if not
	 */
	remove(obj: T) {
		const item = obj.__llReferences
			? (obj.__llReferences[this.id] as InternalItem<T>)
			: undefined

		if (item === undefined || item === null) {
			throw new Error('Item to be removed was not specified')
		}

		delete obj.__llReferences[this.id]

		if (!this.start || !this.end) {
			return false
		}

		this.length--

		if (item === this.end && item === this.start) {
			this.end = undefined
			this.start = undefined

			return true
		}

		if (item === this.end) {
			this.end = this.end.previous

			if (this.end) {
				this.end.next = undefined
			}

			return true
		}

		if (item === this.start) {
			this.start = item.next

			if (this.start) {
				this.start.previous = undefined
			}

			return true
		}

		if (item.previous) {
			item.previous.next = item.next
		}

		if (item.next) {
			item.next.previous = item.previous
		}

		return true
	}

	/**
	 * Checks if this list contains specified item.
	 */
	contains(obj: T) {
		return !!obj.__llReferences && !!obj.__llReferences[this.id]
	}

	/**
	 * Cycles through all items. Callback is called with following arguments:
	 *  item content
	 *  item
	 *  item index
	 *
	 * If callback returns anything considered as true, cycle will be stopped.
	 *
	 * @param function callback
	 */
	each(
		callback: (value: T, item: InternalItem<T>, index: number) => boolean | void
	) {
		let current = this.start,
			index = 0

		while (current != null) {
			if (callback(current.content, current, index)) {
				break
			}

			current = current.next
			index++
		}
	}

	array() {
		let current = this.start
		const result = [] as T[]

		while (current != null) {
			result.push(current.content)

			current = current.next
		}

		return result
	}

	first() {
		return this.start != null ? this.start.content : null
	}

	last() {
		return this.end != null ? this.end.content : null
	}

	firstItem() {
		return this.start
	}

	lastItem() {
		return this.end
	}

	createIter() {
		return new Iterator<T>(this)
	}

	toString() {
		const iter = new Iterator(this)
		let str = '['
		let item = null

		while ((item = iter.next())) {
			str += item.toString() + ','
		}

		if (str.substr(str.length - 1, 1) == ',') {
			str = str.substr(0, str.length - 1)
		}

		str += ']'

		return str
	}
}

export interface InternalItem<T extends LinkedListItem = LinkedListItem> {
	previous?: InternalItem<T>
	next?: InternalItem<T>
	content: T
}

export interface LinkedListItem {
	__llReferences: { [id: number]: InternalItem<LinkedListItem> }
}

export class Iterator<T extends LinkedListItem> {
	protected point?: InternalItem<T>

	constructor(public list: LinkedList<T>) {}

	reset() {
		this.point = undefined
	}

	peek() {
		return this.point ? this.point.content : null
	}

	next() {
		if (!this.point) {
			this.point = this.list.firstItem()
		} else {
			this.point = this.point.next
		}

		return this.point ? this.point.content : null
	}
}
