import { contextBridge, ipcRenderer } from 'electron'

const api = {
  listPages: () => ipcRenderer.invoke('pages:list'),
  loadPage: (pageId: string) => ipcRenderer.invoke('pages:load', pageId),
  savePage: (page: unknown) => ipcRenderer.invoke('pages:save', page),
  deletePage: (pageId: string) => ipcRenderer.invoke('pages:delete', pageId)
}

contextBridge.exposeInMainWorld('api', api)
