import { Configuration } from '../typings/configuration'
import Validator from 'validatorjs'
import yaml from 'js-yaml'
import fs from 'fs-extra'

const rules = {
  'repos.*.url':  'required|url',
  'repos.*.name':  'required|string',
}

/**
 * fetch the configuration file
 * 
 * @param path - the file path
 */
export const fetchConfiguration = (path: string): Configuration => {
  let config: Configuration
  try {
    const contents = fs.readFileSync(path, 'utf8')
    config = yaml.load(contents) as Configuration
  } catch(e) {
    throw new Error('failed to read or parse the configuration file')
  }

  if ((new Validator(config, rules)).fails()) {
    throw new Error('configuration is invalid, please correct the config file')
  }

  return config
}