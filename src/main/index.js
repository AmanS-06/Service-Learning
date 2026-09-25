import { app, BrowserWindow, Menu, shell } from 'electron'
import { join } from 'path'
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

// Electron's default menu minus Help (which only links to Electron's own website).
function setAppMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { role: 'fileMenu' },
      { role: 'editMenu' },
      { role: 'viewMenu' },
      { role: 'windowMenu' }
    ])
  )
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
