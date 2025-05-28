const test = [
	<div class={{ selected: current() === 'foo' }} />,
	<div
		class={{ selected: current() === 'foo' }}
		class={{ selected: current() === 'foo' }}
	/>,
	<div
		class="red"
		class={{ selected: current() === 'foo' }}
	/>,
]
