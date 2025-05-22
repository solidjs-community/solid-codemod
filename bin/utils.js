import fs from 'fs'
import { execSync as $ } from 'child_process'

import chalk from 'chalk'
import { globbySync } from 'globby'

export const log = string => console.log('\n' + string)
export const red = string => log(chalk.redBright(string))
export const blueBright = string => log(chalk.blueBright(string))
export const blue = string => log(chalk.blue(string))
export const green = string => log(chalk.greenBright(string))

export const read = name =>
	fs.readFileSync(name, { encoding: 'utf8' })

export const write = (name, content) =>
	fs.writeFileSync(mkdir(name), content)

export const copy = (source, destination) =>
	fs.copyFileSync(source, destination)

export const remove = name => {
	try {
		fs.rmSync(name)
	} catch (e) {}
}

export const glob = input =>
	globbySync(input, {
		gitignore: true,
		ignore: ['node_modules/**', '.git/**'],
	}).filter(x => /(tsx|ts|jsx|js)$/.test(x))

export const getDirectories = source =>
	fs
		.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)

export const prettier = file => $(`prettier "${file}" --write`)

process.on('exit', () => console.log())
