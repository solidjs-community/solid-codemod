import { render } from 'solid-js/web'

function Component(props) {
	return (
		<video
			aria-hidden="true"
			disableRemoteplayback={true}
			onClick="lala"
		></video>
	)
}

render(() => <Component />, document.getElementById('app'))
