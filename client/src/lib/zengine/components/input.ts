/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '../component'

export class InputComponent extends Component {
	protected mouseButtons: { [code: number]: boolean } = {}
	protected mousePress: { [code: number]: boolean } = {}

	protected keys: { [code: string]: boolean } = {}
	protected press: { [code: string]: boolean } = {}

	locked = false

	protected lockRequested = false

	mouse: {
		x: number
		y: number
		movementX: number
		movementY: number
	} = {
		x: 0,
		y: 0,
		movementX: 0,
		movementY: 0
	}

	start() {
		window.addEventListener('keydown', (e) => this.onKeyDown(e))
		window.addEventListener('keyup', (e) => this.onKeyUp(e))

		window.addEventListener('click', () => this.onClick())
		window.addEventListener('mousedown', (e) => this.onMouseDown(e))
		window.addEventListener('mousemove', (e) => this.onMouseMove(e))
		window.addEventListener('mouseup', (e) => this.onMouseUp(e))

		window.addEventListener('contextmenu', (e) => {
			e.stopPropagation()
			e.preventDefault()
		})

		const handlers = [
			'pointerlockchange',
			'mozpointerlockchange',
			'webkitpointerlockchange'
		]

		const errorHandlers = [
			'pointerlockerror',
			'mozpointerlockerror',
			'webkitpointerlockerror'
		]

		for (const i in handlers) {
			document.addEventListener(
				handlers[i],
				() => {
					this.locked = this.onPointerLockChange()
				},
				false
			)
		}

		for (const i in errorHandlers) {
			document.addEventListener(
				errorHandlers[i],
				() => {
					this.locked = false
				},
				false
			)
		}
	}

	protected onClick() {
		if (this.lockRequested) {
			this.lockRequested = false
			this.actuallyLockPointer()
		}
	}

	protected onMouseMove(event: MouseEvent) {
		const mouseX = event.clientX
		const mouseY = event.clientY

		this.mouse.x = mouseX
		this.mouse.y = mouseY

		this.mouse.movementX +=
			event.movementX ||
			(<any>event).mozMovementX ||
			(<any>event).webkitMovementX ||
			0

		this.mouse.movementY +=
			event.movementY ||
			(<any>event).mozMovementY ||
			(<any>event).webkitMovementY ||
			0
	}

	protected onMouseDown(e: MouseEvent) {
		this.mouseButtons[e.button] = true
		this.mousePress[e.button] = true
	}

	protected onMouseUp(e: MouseEvent) {
		this.mouseButtons[e.button] = false
	}

	protected onKeyDown(e: KeyboardEvent) {
		this.keys[e.code.toLowerCase()] = true
		this.press[e.code.toLowerCase()] = true
	}

	protected onKeyUp(e: KeyboardEvent) {
		this.keys[e.code.toLowerCase()] = false
	}

	keyPressed(code: string) {
		return !!this.press[code.toLowerCase()]
	}

	keyDown(code: string) {
		return !!this.keys[code.toLowerCase()]
	}

	keyUp(code: string) {
		return !!!this.keys[code.toLowerCase()]
	}

	mouseDown(code: number) {
		return !!this.mouseButtons[code]
	}

	mousePressed(code: number) {
		return !!this.mousePress[code]
	}

	tick() {
		this.press = {}
		this.mousePress = {}
		this.mouse.movementX = 0
		this.mouse.movementY = 0
	}

	lockPointer() {
		this.lockRequested = true
	}

	protected actuallyLockPointer() {
		document.body.requestPointerLock =
			document.body.requestPointerLock ||
			(<any>document.body).mozRequestPointerLock ||
			(<any>document.body).webkitRequestPointerLock

		document.body.requestPointerLock()
	}

	private onPointerLockChange() {
		return (
			document.pointerLockElement === document.body ||
			(<any>document).mozPointerLockElement === document.body ||
			(<any>document).webkitPointerLockElement === document.body
		)
	}
}

export default InputComponent
