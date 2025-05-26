// WIP do not mind

const o = {
	autoFocus: true,
}

const test = [
	<video {...o}></video>,
	<video aria-hidden></video>,
	<video aria-hidden={undefined}></video>,
	<video aria-hidden={true}></video>,
	<video aria-hidden={false}></video>,
	<video aria-hidden="true"></video>,
	<video aria-hidden="False"></video>,
	<video onClick={() => {}}></video>,
	<video disableRemotePlayback={true}></video>,
]
