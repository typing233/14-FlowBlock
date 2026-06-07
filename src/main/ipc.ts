import { ipcMain } from 'electron'
import { listPages, loadPage, savePage, deletePage } from './services/fileService'

export function registerIpcHandlers(): void {
  ipcMain.handle('pages:list', async () => {
    return listPages()
  })

  ipcMain.handle('pages:load', async (_event, pageId: string) => {
    return loadPage(pageId)
  })

  ipcMain.handle('pages:save', async (_event, page) => {
    return savePage(page)
  })

  ipcMain.handle('pages:delete', async (_event, pageId: string) => {
    return deletePage(pageId)
  })
}
