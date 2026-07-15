import { Configuration } from '../typings/configuration'
import simpleGit from 'simple-git'
import path from 'path'

/**
 * clones the repository into a certain directory
 * 
 * @param name - the repository name
 * @param url - the repository url
 * @param directory - the output directory
 */
const cloneRepository = async (name: string, url: string, directory: string) => {
  console.log(`pulling ${url}`)
  const location = path.join(directory, name).toLowerCase()
  try {
    await simpleGit().clone(url, location)
  } catch {
    // assume already present
  }

  // pull latest changes
  await simpleGit(location).pull()
}

/**
 * fetch repositories listed in the config
 * 
 * @param config - the configuration
 * @param directory - the export path
 */
export const fetchRepositories = async (config: Configuration, directory: string) => {
  // check if all names are unique
  const names = config.repos.map(({ name }) => name.toLowerCase())
  if ((new Set(names)).size !== names.length) {
    throw new Error('all repository names need to be unique')
  }

  // clone all repositories
  for (let repo of config.repos) {
    await cloneRepository(repo.name, repo.url, directory)
  }
}