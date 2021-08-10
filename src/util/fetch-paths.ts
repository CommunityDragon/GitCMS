import memoize from 'memoizee'
import slugify from 'slug'
import fs from 'fs-extra'
import glob from 'glob'
import path from 'path'

/**
 * get all matches
 * 
 * @param regex - the regex
 * @returns the matches
 */
const matches = (regex: string): Promise<string[]> => (
  new Promise((resolve, reject) => (
    glob(regex, (err, x) => err ? reject(err) : resolve(x))
  ))
)

/**
 * returns a list of directories located in another directory
 * 
 * @param directory - the root directort
 * @returns - list of directories
 */
export const fetchDirectories = memoize((directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name), { maxAge: 1000 * 60 * 5 })

/**
 * fetch all files
 * 
 * @param directory - the output directory
 * @return a list of files
 */
export const fetchFiles = memoize(async (directory: string): Promise<string[]> => {
  let list = await matches(path.join(process.cwd(), directory, '**/*.{md,MD,mD,Md}'))
  list = list.map(item => path.relative(path.join(process.cwd(), directory), item))
  return list.filter(item => !item.startsWith('.') && !item.includes('/.'))
}, { promise: true, maxAge: 1000 * 60 * 5 })

/**
 * maps files to paths
 * 
 * @param files - list of files
 * @returns - list of a set of files and paths
 */
const mapFilesToPaths = (files: string[]): { [path: string]: string } => {
  let list = files.map(file => ({ file, path: file.toLowerCase() }))
  list = list.map(({ file, path }) => ({ file, path: path.substr(0, path.length - 3) }))
  list = list.map(({ file, path }) => ({ file, path: path.endsWith('index') ? path.substr(0, path.length - 5) : path }))
  list = list.map(({ file, path }) => ({ file, path: path.endsWith('readme') ? path.substr(0, path.length - 6) : path }))
  list = list.filter(({ file, path }) => (
    (path.endsWith('/') && file.toLowerCase().endsWith('readme.md'))
      ? !list.some(item => item.path === path && item.file !== item.file)
      : true
  ))
  list = Array.from(new Set(list.map(({ file, path }) => ({ file, path: (
    path.endsWith('/') && path !== '/' ? path.substr(0, path.length - 1) : path
  )}))))
  return list.reduce((acc, cur) => ({ ...acc, [
    cur.path.split('/').map(x => slugify(x)).join('/')
  ]: cur.file }), {} as any)
}

/**
 * fetch path mapping
 * 
 * @param directory - the export directory
 * @returns mapping of all paths
 */
export const fetchPathMap = async (directory: string): Promise<{ [path: string]: string }> => {
  return mapFilesToPaths(await fetchFiles(directory))
}

/**
 * list all paths available
 * 
 * @param directory - the export directory
 * @returns list of all paths
 */
export const fetchPaths = async (directory: string): Promise<string[]> => {
  const files = await fetchFiles(directory)
  const sets = mapFilesToPaths(files)
  return Object.keys(sets)
}