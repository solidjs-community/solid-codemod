import { render } from 'solid-js/web'

function Component(props) {
	return <video disableRemotePlayback={true}></video>
}

render(() => <Component />, document.getElementById('app'))
