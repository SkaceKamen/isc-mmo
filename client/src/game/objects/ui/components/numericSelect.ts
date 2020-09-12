import { select } from './select'

export const numericSelect = <
	T extends { value: number; label: string }
>(props: {
	value: string | number
	items: T[]
	onChange: (v: number) => void
}) => select({ ...props, onChange: (v: string) => props.onChange(+v) })
