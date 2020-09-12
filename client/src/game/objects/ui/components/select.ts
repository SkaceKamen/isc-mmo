import { html } from 'lighterhtml'

export const select = <T extends { value: string | number; label: string }>({
	value,
	items,
	onChange
}: {
	value: string | number
	items: T[]
	onChange: (v: string) => void
}) => {
	const handleChange = (e: Event) => {
		if (e.target) {
			const select = e.target as HTMLSelectElement
			onChange(select.value)
		}
	}

	if (items.length > 0 && !items.find((i) => i.value === value)) {
		onChange(String(items[0].value))
	}

	return html`<select onchange=${handleChange}>
		${items.map(
			(i) =>
				html`<option value="${i.value}" selected=${value === i.value}>
					${i.label}
				</option>`
		)}
	</select>`
}
