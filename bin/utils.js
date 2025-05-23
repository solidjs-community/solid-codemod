import fs from 'fs'
import { execSync as $ } from 'child_process'

import chalk from 'chalk'
import diff from 'cli-diff'
import path from 'path'

export const log = string => console.log('\n' + string)
export const red = string => log(chalk.redBright(string))
export const blueBright = string => log(chalk.cyanBright(string))
export const blue = string => log(chalk.cyan(string))
export const green = string => log(chalk.greenBright(string))

export const read = name =>
	fs.readFileSync(name, { encoding: 'utf8' })

export const write = (name, content) =>
	fs.writeFileSync(name, content)

export const copy = (source, destination) =>
	fs.copyFileSync(source, destination)

export const remove = name => {
	try {
		fs.rmSync(name)
	} catch (e) {}
}

/** @returns {string[]} */
export const getFiles = (...args) => [
	...new Set(
		args
			.flat(Infinity)
			.map(a => getFilesRecurse(a))
			.flat(Infinity)
			.filter(x => /(tsx|ts|jsx|js)$/.test(x)),
	),
]

/** @returns {string[]} */
const getFilesRecurse = (source, files = []) => {
	if (/(\.git|node_modules)/.test(source)) {
		return files
	} else if (fs.statSync(source).isDirectory()) {
		for (const file of fs.readdirSync(source)) {
			getFilesRecurse(path.join(source, file), files)
		}
		return files
	} else {
		files.push(source)
		return files
	}
}

/** @returns {string[]} */
export const getDirectories = source =>
	fs
		.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)

export const prettier = file =>
	$(
		`prettier "${file}" --write --config ./package.json --no-editorconfig --ignore-path="false"`,
	)

export const diffFiles = (a, b) => (diff.default || diff)(a, b)
