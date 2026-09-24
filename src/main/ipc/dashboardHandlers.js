import { ipcMain } from 'electron'
import { getDb } from '../db/database.js'

export function registerDashboardHandlers() {
  const db = getDb()

  ipcMain.handle('dashboard:summary', () => {
    const benTotal  = db.prepare('SELECT COUNT(*) as c FROM beneficiaries').get().c
    const benMale   = db.prepare("SELECT COUNT(*) as c FROM beneficiaries WHERE sex = 'Male'").get().c
    const benFemale = db.prepare("SELECT COUNT(*) as c FROM beneficiaries WHERE sex = 'Female'").get().c
    const stallTx   = db.prepare('SELECT COUNT(*) as c FROM stall_sales').get().c
    const stallRev  = db.prepare('SELECT COALESCE(SUM(amount),0) as s FROM stall_sales').get().s

    const inventory = db.prepare(`
      SELECT
        item_name,
        SUM(CASE WHEN entry_type = 'MANUFACTURING' THEN quantity ELSE 0 END) AS manufactured,
        SUM(CASE WHEN entry_type = 'SELL'          THEN quantity ELSE 0 END) AS sold
      FROM production_log
      GROUP BY item_name
      ORDER BY item_name
    `).all().map(row => {
      const stock_left = row.manufactured - row.sold
      return {
        ...row,
        stock_left,
        status:
          stock_left <= 0  ? 'Out of Stock' :
          stock_left <= 20 ? 'Low Stock'    : 'OK'
      }
    })

    return { benTotal, benMale, benFemale, stallTx, stallRev, inventory }
  })
}