/**
 * yaml configuration file type
 */
export interface Configuration {
  repos: {
    url: string
    name: string
  }[]
}