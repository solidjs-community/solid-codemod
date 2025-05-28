const test = [
	<div classList={{ selected: current() === 'foo' }} />,
	<div
		classList={{ selected: current() === 'foo' }}
		classList={{ selected: current() === 'foo' }}
	/>,
	<div
		class="red"
		classList={{ selected: current() === 'foo' }}
	/>,
]
