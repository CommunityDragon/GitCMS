
import { fetchDirectories, fetchPaths } from './util/fetch-paths'
import { fetchConfiguration } from './util/fetch-config'
import { fetchRepositories } from './util/fetch-repos'
import { fetchPage, Page } from './util/fetch-page'
import { buildSidebar } from './util/build-sidebar'
import { fetchTitles } from './util/fetch-titles'
import express from 'express'

const config = fetchConfiguration('./config.yml')
const odir = 'repos'
const app = express()
const port = 4000

/**
 * bootstrap server
 */
const bootstrap = async () => {
  await fetchRepositories(config, odir)
  await fetchPaths(odir)

  /**
   * list all projects
   */
  app.get('/projects', (_, res) => {
    try {
      res.json(fetchDirectories(odir))
    } catch(e) {
      res.status(400).json({
        error: e.message,
        status: 400,
      })
    }
  })

  /**
   * return the available paths
   */
  app.get('/projects/:project/pages', async (req, res) => {
    if (!fetchDirectories(odir).includes(req.params.project)) {
      return res.status(404).json({
        error: 'project not found',
        status: 404,
      })
    }

    try {
      res.json(
        (await fetchPaths(odir))
          .filter(path => path.startsWith(req.params.project))
          .map(path => path.substr(req.params.project.length))
          .map(path => path.startsWith('/') ? path.substr(1) : path)
      )
    } catch(e) {
      res.status(400).json({
        error: e.message,
        status: 400,
      })
    }
  })

  /**
   * return a page of a repository
   */
  app.get('/projects/:project/page/*', async (req, res) => {
    if (!fetchDirectories(odir).includes(req.params.project)) {
      return res.status(404).json({
        error: 'project not found',
        status: 404,
      })
    }

    const slug = (req.params as any)['0']
    const project = req.params.project
    let page: Page

    try {
      page = await fetchPage(config, odir, project, slug)
    } catch (e) {
      return res.status(404).json({
        error: e.message,
        status: 404,
      })
    }
    
    const titles = await fetchTitles(odir, project)
    const meta = { ...page.attributes, title: titles[slug] }
    const sidebar = buildSidebar(titles)
    const body = page.body

    res.json({ meta, project, sidebar, body })
  })
  
  app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`)
  })
}

bootstrap()
