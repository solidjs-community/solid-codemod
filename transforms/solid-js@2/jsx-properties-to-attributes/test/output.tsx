import { render } from 'solid-js/web'

function Component(props) {
	return <video disableremotePlayback={true}></video>
}

render(() => <Component />, document.getElementById('app'))
