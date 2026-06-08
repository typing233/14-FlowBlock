import { ipcMain, BrowserWindow } from 'electron'
import { listPages, loadPage, savePage, deletePage, movePage, listSpaces, createSpace, renameSpace, deleteSpace, searchPages, listAllPages } from './services/fileService'
import { exportToMarkdown, exportToPdf } from './services/exportService'
import { importMarkdown } from './services/importService'

export function registerIpcHandlers(): void {
  // Space operations
  ipcMain.handle('spaces:list', async () => {
    return listSpaces()
  })

  ipcMain.handle('spaces:create', async (_event, space) => {
    return createSpace(space)
  })

  ipcMain.handle('spaces:rename', async (_event, spaceId: string, name: string) => {
    return renameSpace(spaceId, name)
  })

  ipcMain.handle('spaces:delete', async (_event, spaceId: string) => {
    return deleteSpace(spaceId)
  })

  // Page operations
  ipcMain.handle('pages:list', async (_event, spaceId: string) => {
    return listPages(spaceId)
  })

  ipcMain.handle('pages:load', async (_event, spaceId: string, pageId: string) => {
    return loadPage(spaceId, pageId)
  })

  ipcMain.handle('pages:save', async (_event, page) => {
    return savePage(page)
  })

  ipcMain.handle('pages:delete', async (_event, spaceId: string, pageId: string) => {
    return deletePage(spaceId, pageId)
  })

  ipcMain.handle('pages:move', async (_event, spaceId: string, pageId: string, parentId: string | null, order: number) => {
    return movePage(spaceId, pageId, parentId, order)
  })

  // Search
  ipcMain.handle('search:query', async (_event, query: string, spaceId?: string) => {
    return searchPages(query, spaceId)
  })

  // Export
  ipcMain.handle('export:markdown', async (event, page) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    return exportToMarkdown(page, win)
  })

  ipcMain.handle('export:pdf', async (event, page) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    return exportToPdf(page, win)
  })

  // Import
  ipcMain.handle('import:markdown', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    return importMarkdown(win)
  })
}
