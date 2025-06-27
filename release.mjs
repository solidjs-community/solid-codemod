import { execSync as $ } from 'child_process'

// bump version number
$('npm version minor --git-tag-version false')

// read version number
import('./package.json', {
	with: { type: 'json' },
}).then(json => {
	const version = json.default.version

	// git add, commit with version number
	$('git add --all')
	$('git commit -m "v' + version + '"')
	$('git tag "v' + version + '" -m "v' + version + '"')

	// git push / npm publish
	$('git push --all')
	$('git push origin --tags')
	$('npm publish')
})
