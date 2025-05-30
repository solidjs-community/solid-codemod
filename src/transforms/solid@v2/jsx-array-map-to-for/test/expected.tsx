import { createSignal, For } from 'solid-js'

const test = [
	<div>
		<For each={array1}>{el1 => <div>{el1.name}</div>}</For>
	</div>,
	<div>
		<For each={array2}>{el2 => <div>{el2.name}</div>}</For>
		<For each={array3}>{el3 => <div>{el4.name}</div>}</For>
	</div>,
]

export const Looper = () => {
	return (
		<div>
			<For each={array}>{el => <div>{el.name}</div>}</For>
		</div>
	)
}
