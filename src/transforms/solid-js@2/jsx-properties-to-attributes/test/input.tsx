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
	<div
		attr:onsubmit={true && 'return false;'}
		attr:onsubmit={true && 'return false;'}
		onsubmit={true && 'return false;'}
		onlala={true && 'return false;'}
		onlala2={'return false;'}
		onlala2="return false;"
		onlala2={function (e) {
			return false
		}}
		onlala2={e => {
			return false
		}}
		autofocus={true}
		autofocus={signal()}
		autofocus={undefined}
		autofocus={quack}
		autofocus={quack.quack}
		autofocus={function () {}}
		autofocus={() => {}}
		autofocus={true}
		autofocus={false}
		autofocus={'true'}
		autofocus={'false'}
		autofocus="false"
		autofocus="true"
		autofocus="0"
		autofocus="1"
		autofocus=""
		autofocus=""
		autofocus={0}
		autofocus={1}
		autofocus={6}
		autofocus={void 0}
		autofocus={quack ? true : false}
		autofocus={quack || 'true'}
		autofocus={quack ?? 'true'}
		autofocus={quack ? 'true' : 'false'}
		autofocus={quack || 'true'}
		autofocus={quack ?? 'true'}
		autofocus={quack ?? 'false'}
		autofocus={quack ?? true}
		autofocus={quack ?? false}
		aria-hidden={true}
		aria-hidden={signal()}
		aria-hidden={undefined}
		aria-hidden={quack}
		aria-hidden={quack.quack}
		aria-hidden={function () {}}
		aria-hidden={() => {}}
		aria-hidden={true}
		aria-hidden={false}
		aria-hidden={'true'}
		aria-hidden={'false'}
		aria-hidden="false"
		aria-hidden="true"
		aria-hidden="0"
		aria-hidden="1"
		aria-hidden=""
		aria-hidden=""
		aria-hidden={0}
		aria-hidden={1}
		aria-hidden={6}
		aria-hidden={void 0}
		aria-hidden={quack ? 'true' : 'false'}
		aria-hidden={quack || 'true'}
		aria-hidden={quack ?? 'true'}
		aria-hidden={quack ?? 'false'}
		aria-hidden={quack ?? true}
		aria-hidden={quack ?? false}
	/>,
]
