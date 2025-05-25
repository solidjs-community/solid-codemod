import { render } from 'solid-js/web'

function Component(props) {
	return (
		<video
			aria-hidden
			disableRemoteplayback={true}
			onClick="lalal"
		></video>
	)
}

render(() => <Component />, document.getElementById('app'))
