import { app, BrowserWindow, Menu, dialog, shell } from 'electron'
import { join } from 'path'
import { getDb } from './db/database.js'
import { clearAllData, resetToDemoData } from './db/demoData.js'
import { registerBeneficiaryHandlers } from './ipc/beneficiaryHandlers.js'
import { registerStallSalesHandlers } from './ipc/stallSalesHandlers.js'
import { registerDashboardHandlers } from './ipc/dashboardHandlers.js'
import { registerProductionHandlers } from './ipc/productionHandlers.js'

function registerAllHandlers() {
  registerBeneficiaryHandlers()
  registerStallSalesHandlers()
  registerDashboardHandlers()
  registerProductionHandlers()
}

// The Demo menu (load or clear test data) shows while developing with `npm run dev`,
// or in the installed app only when it is started with --demo. Everyday users never see it.
const SHOW_DEMO_MENU = !app.isPackaged || process.argv.includes('--demo')

// Asks first, saves a backup copy of the data file, then replaces or clears every record
// and reloads the window so all pages show the new data.
async function changeAllData(action) {
  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
  const reset = action === 'reset'
  const options = {
    type: 'warning',
    buttons: ['Cancel', reset ? 'Replace with demo data' : 'Delete everything'],
    defaultId: 0,
    cancelId: 0,
    noLink: true,
    message: reset ? 'Replace all records with the demo data?' : 'Delete all records?',
    detail: 'A backup copy of the current data is saved in the data folder first.'
  }
  const { response } = win
    ? await dialog.showMessageBox(win, options)
    : await dialog.showMessageBox(options)
  if (response !== 1) return

  try {
    const db = getDb()
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    await db.backup(join(app.getPath('userData'), `fieldlog-backup-${stamp}.db`))
    if (reset) resetToDemoData(db)
    else clearAllData(db)
    win?.webContents.reload()
  } catch (err) {
    dialog.showErrorBox('Could not change the data', String(err?.message || err))
  }
}

// Electron's default menu minus Help (which only links to Electron's own website).
function setAppMenu() {
  const template = [
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' }
  ]
  if (SHOW_DEMO_MENU) {
    template.push({
      label: 'Demo',
      submenu: [
        { label: 'Reset to demo data...', click: () => changeAllData('reset') },
        { label: 'Clear all data...', click: () => changeAllData('clear') },
        { type: 'separator' },
        { label: 'Open data folder', click: () => shell.openPath(app.getPath('userData')) }
      ]
    })
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#ffffff',
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerAllHandlers()
  setAppMenu()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
