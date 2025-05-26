import { render } from 'solid-js/web'

function Component(props) {
	return (
		<video
			aria-hidden="true"
			disableremoteplayback={true}
			onClick="lala"
		></video>
	)
}

render(() => <Component />, document.getElementById('app'))
