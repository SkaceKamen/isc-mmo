/* eslint-disable @typescript-eslint/no-explicit-any */
import Entity3D, { ExportedProperty, PropertyType } from '@/game/entity3d'
import { html } from 'lighterhtml'

export const entityInspector = (entity: Entity3D | undefined) => {
	if (!entity) {
		return html`No entity selected`
	}

	const props = (entity.constructor as typeof Entity3D).exportedProperties

	return html`<div class="entity-inspector">
		${Object.entries(props).map(([name, info]) => property(name, info, entity))}
	</div>`
}

export const property = (
	prop: string,
	info: ExportedProperty,
	entity: Entity3D
) => {
	const id = `inspect_${prop}`

	const value =
		info.get !== undefined ? info.get(entity) : (entity as any)[prop]

	const handleChange = (v: any) => {
		if (info.set !== undefined) {
			info.set(v, entity)
		} else {
			;(entity as any)[prop] = v
		}
	}

	return html`
		<div class="property">
			<label class="label" for="${id}">${prop}</label>
			${propertyRenderers[info.type]({
				id,
				prop,
				info,
				value,
				entity,
				onChange: handleChange
			})}
		</div>
	`
}

type RendererProps = {
	id: string
	prop: string
	info: ExportedProperty
	value: number
	entity: Entity3D
	onChange: (v: any) => void
}

export const numberProperty = ({
	id,
	value,
	info: p,
	onChange
}: RendererProps) => {
	const handleChange = (e: Event) => {
		onChange(parseFloat((e.target as HTMLInputElement).value))
	}

	return html`<input
		id="${id}"
		type="number"
		value="${value}"
		onchange="${handleChange}"
		min="${p.min}"
		max="${p.max}"
		step="${p.step}"
	/>`
}

export const numberRangeProperty = ({
	id,
	value,
	info: p,
	onChange
}: RendererProps) => {
	const handleChange = (e: Event) => {
		onChange(parseFloat((e.target as HTMLInputElement).value))
	}

	return html`<input
		id="${id}"
		type="range"
		value="${value}"
		onchange="${handleChange}"
		min="${p.min}"
		max="${p.max}"
		step="${p.step}"
	/>`
}

export const stringProperty = ({ id, value, onChange }: RendererProps) => {
	const handleChange = (e: Event) => {
		onChange((e.target as HTMLInputElement).value)
	}

	return html`<input
		id="${id}"
		type="text"
		value="${value}"
		onchange="${handleChange}"
	/>`
}

export const choiceProperty = ({
	id,
	value: selected,
	info,
	onChange,
	entity
}: RendererProps) => {
	const handleChange = (e: Event) => {
		onChange((e.target as HTMLSelectElement).value)
	}

	const options =
		typeof info.choices === 'function'
			? info.choices(entity)
			: info.choices ?? []

	return html`<select id="${id} onChange="${handleChange}">
		${options.map(
			({ value, label }) =>
				html`<option value="${value}" selected="${value === selected}">
					${label}
				</option>`
		)}
	</select>`
}

export const customProperty = ({
	value,
	info,
	onChange,
	entity
}: RendererProps) => {
	if (!info.render) {
		throw new Error('Missing render prop')
	}

	return info.render(value, entity, onChange)
}

const propertyRenderers = {
	[PropertyType.Number]: numberProperty,
	[PropertyType.NumberRange]: numberRangeProperty,
	[PropertyType.String]: stringProperty,
	[PropertyType.Choice]: choiceProperty,
	[PropertyType.Custom]: customProperty
}
