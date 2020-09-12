/**
 * Example: $c('div').css('mail').html();
 * Example: $c('input').type('text').attr('placeholder').html()
 */

export function $c(type: 'div'): $ce<HTMLDivElement>
export function $c(type: 'span'): $ce<HTMLSpanElement>
export function $c(type: 'a'): $ce<HTMLAnchorElement>
export function $c(type: 'img'): $ce<HTMLImageElement>
export function $c(type: 'button'): $ce<HTMLButtonElement>

export function $c<T extends HTMLElement = HTMLElement>(type: string) {
	return new $ce<T>(type)
}

export default $c

export class $ce<E extends HTMLElement = HTMLElement> {
	private element: E

	constructor(type: string) {
		this.element = document.createElement(type) as E
	}

	child(e: $ce | E) {
		if (e instanceof $ce) {
			this.element.appendChild(e.html())
		} else {
			this.element.appendChild(e)
		}

		return this
	}

	attr(name: string, value: string) {
		if (this.element.setAttribute) {
			this.element.setAttribute(name, value)
		} else {
			const attrib = document.createAttribute(name)
			attrib.value = value
			this.element.setAttributeNode(attrib)
		}

		return this
	}

	css(name: string) {
		if (this.element.className.length > 0) {
			this.element.className += ' '
		}

		this.element.className += name

		return this
	}

	style(
		name: keyof Omit<CSSStyleDeclaration, 'length' | 'parentRule'>,
		value: string
	) {
		this.element.style[name] = value

		return this
	}

	content(ct: string) {
		this.element.innerHTML = ct

		return this
	}

	type(type: string) {
		return this.attr('type', type)
	}

	html() {
		return this.element
	}
}
