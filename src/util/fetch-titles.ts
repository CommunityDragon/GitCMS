import { fetchPathMap } from "./fetch-paths"
import cheerio from "cheerio"
import fm from "front-matter"
import marked from "./marked"
import fs from "fs-extra"
import path from "path"

/**
 * fetches the title data
 * 
 * @param directory - the root directory
 * @param project - the project name
 * @returns a set of paths and titles
 */
export const fetchTitles = async (directory: string, project: string): Promise<{ [path: string]: string }> => {
  const pathMap = await fetchPathMap(directory)
  Object.keys(pathMap).forEach(path => {
    if (!path.startsWith(project)) delete pathMap[path]
  })

  Object.keys(pathMap).forEach(path => {
    const newPath = path.substr(project.length)
    if (newPath !== path) {
      pathMap[newPath.startsWith('/') ? newPath.substr(1) : newPath] = pathMap[path]
      delete pathMap[path]
    }
  })

  const titleMap = { ...pathMap }
  Object.keys(titleMap).forEach(path => titleMap[path] = '')
  await Promise.allSettled(Object.keys(titleMap).map(async (link) => {
    const fullPath = path.join(process.cwd(), directory, pathMap[link])
    const content = await fs.readFile(fullPath, 'utf8')
    const data = fm<any>(content)

    if (data.attributes.title) {
      titleMap[link] = data.attributes.title
      return
    }

    const $ = cheerio.load(marked(data.body))
    const h1 = $('h1')

    if (h1 && h1.text()) {
      titleMap[link] = h1.text()
      return
    }

    let fileName = path.basename(fullPath)
    fileName = fileName.substr(0, fileName.length - 3)
    titleMap[link] = fileName.split(' ')
      .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
      .join(' ')
  }))

  return titleMap
}