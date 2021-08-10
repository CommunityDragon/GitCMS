import path from "path"

interface SidebarItem {
  path: string,
  title: string,
}

type Sidebar = Array<SidebarItem & Sidebar>

/**
 * builds the sidebar from a title mapping
 * 
 * @param titles - the title mapping
 * @param project - the project name
 * @returns a sidebar object
 */
export const buildSidebar = (titles: { [path: string]: string }): Sidebar => {
  const keys = Object.keys(titles)
  .map(x => x === '' ? '/' : x)
  .sort((a, b) => a.split('/').length - b.split('/').length)
  .sort((a, b) => a.localeCompare(b))
  .reverse()

  const formatSidebar = (leftKeys: string[], beforePath?: string): any => {
    let k = [...leftKeys]
    let arr = []
    let key = k.pop() as string
    
    while (key) {
      const children = k.filter(x => x.startsWith(key))
      k = k.filter(x => !x.startsWith(key!))
      const r = (formatSidebar(children, beforePath ? path.join(beforePath, key) : key))
      if (r.length > 0) {
        r.unshift({ path: key === '/' ? '' : key, title: titles[key === '/' ? '' : key] })
        arr.push(r)
      } else {
        arr.push({ path: key === '/' ? '' : key, title: titles[key === '/' ? '' : key] })
      }
      key = k.pop() as string
    }
    return arr
  }

  return formatSidebar(keys)
}