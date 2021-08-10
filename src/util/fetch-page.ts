import { Configuration } from "../typings/configuration"
import fm, { FrontMatterResult } from 'front-matter'
import { fetchPathMap } from "./fetch-paths"
import marked from './marked'
import fs from 'fs-extra'
import path from "path"

/**
 * the page attributes
 */
interface Attributes {
  source: string
  [key: string]: any
}

/**
 * the page
 */
export interface Page extends FrontMatterResult<Attributes> {}

/**
 * fetches the page data
 * 
 * @param config the configuration object
 * @param directory - the export directory
 * @param project - the project name
 * @param slug - the slug
 * @returns a page with the attributes
 */
export const fetchPage = async (config: Configuration, directory: string, project: string, slug: string): Promise<Page> => {
  // fetches the relative path
  const relativePath = (await fetchPathMap(directory))[path.join(project, slug)]
  if (!relativePath) throw new Error('page not found')

  // fetches the repo URL
  let source = config.repos.find(repo => repo.name.toLowerCase() === project.toLowerCase())?.url ?? ''
  if (source !== '') {
    if (source.endsWith('/')) source = source.slice(0, source.length - 1)
    if (source.endsWith('.git')) source = source.slice(0, source.length - 4)

    source += '/blob/master'
    if (relativePath.startsWith(project.toLowerCase())) source += relativePath.slice(project.length)
  }

  // read content
  const fullPath = path.join(process.cwd(), directory, relativePath)
  const content = await fs.readFile(fullPath, 'utf8')
  const data = fm<Attributes>(content)

  // set attributes
  data.attributes.source = data.attributes.source ?? source
  
  return { ...data, body: marked(data.body) }
}
