import { createSignal } from 'solid-js'

const test = [
	<div>
		{array1.map(el1 => (
			<div>{el1.name}</div>
		))}
	</div>,
	<div>
		{array2.map(el2 => (
			<div>{el2.name}</div>
		))}
		{array3.map(el3 => (
			<div>{el4.name}</div>
		))}
	</div>,
]

export const Looper = () => {
	return (
		<div>
			{array.map(el => (
				<div>{el.name}</div>
			))}
		</div>
	)
}
