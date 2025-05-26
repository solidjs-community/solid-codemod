// WIP do not mind

const o = {
	autoFocus: true,
}

const test = [
	<video {...o}></video>,
	<video aria-hidden="true"></video>,
	<video></video>,
	<video aria-hidden="true"></video>,
	<video aria-hidden="false"></video>,
	<video aria-hidden="true"></video>,
	<video aria-hidden="false"></video>,
	<video onClick={() => {}}></video>,
	<video disableremoteplayback></video>,
]
