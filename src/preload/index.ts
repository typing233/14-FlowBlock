import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Spaces
  listSpaces: () => ipcRenderer.invoke('spaces:list'),
  createSpace: (space: unknown) => ipcRenderer.invoke('spaces:create', space),
  renameSpace: (spaceId: string, name: string) => ipcRenderer.invoke('spaces:rename', spaceId, name),
  deleteSpace: (spaceId: string) => ipcRenderer.invoke('spaces:delete', spaceId),

  // Pages
  listPages: (spaceId: string) => ipcRenderer.invoke('pages:list', spaceId),
  loadPage: (spaceId: string, pageId: string) => ipcRenderer.invoke('pages:load', spaceId, pageId),
  savePage: (page: unknown) => ipcRenderer.invoke('pages:save', page),
  deletePage: (spaceId: string, pageId: string) => ipcRenderer.invoke('pages:delete', spaceId, pageId),
  movePage: (spaceId: string, pageId: string, parentId: string | null, order: number) =>
    ipcRenderer.invoke('pages:move', spaceId, pageId, parentId, order),

  // Search
  search: (query: string, spaceId?: string) => ipcRenderer.invoke('search:query', query, spaceId),

  // Export
  exportMarkdown: (page: unknown) => ipcRenderer.invoke('export:markdown', page),
  exportPdf: (page: unknown) => ipcRenderer.invoke('export:pdf', page),

  // Import
  importMarkdown: () => ipcRenderer.invoke('import:markdown'),

  // Window
  newWindow: () => ipcRenderer.invoke('window:new')
}

contextBridge.exposeInMainWorld('api', api)
