import { render } from 'solid-js/web'

function Component(props) {
	return <video disableremoteplayback={true}></video>;
}

render(() => <Component />, document.getElementById('app'))
