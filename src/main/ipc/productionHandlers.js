import { ipcMain } from 'electron'
import { getDb } from '../db/database.js'
import { toCsv } from '../utils/exportCsv.js'

const FIELDS = ['entry_type', 'item_name', 'category', 'quantity', 'unit', 'sold_to']

export function registerProductionHandlers() {
  const db = getDb()

  ipcMain.handle('production:list', () =>
    db.prepare('SELECT * FROM production_log ORDER BY created_at DESC').all()
  )

  ipcMain.handle('production:get', (_, id) =>
    db.prepare('SELECT * FROM production_log WHERE id = ?').get(id)
  )

  ipcMain.handle('production:create', (_, data) => {
    const columns = FIELDS.filter((f) => data[f] !== undefined)
    const placeholders = columns.map(() => '?').join(', ')
    const stmt = db.prepare(
      `INSERT INTO production_log (${columns.join(', ')}, created_at) VALUES (${placeholders}, datetime('now'))`
    )
    const result = stmt.run(...columns.map((c) => data[c]))
    return db.prepare('SELECT * FROM production_log WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('production:update', (_, id, data) => {
    const columns = FIELDS.filter((f) => data[f] !== undefined)
    const setClause = columns.map((c) => `${c} = ?`).join(', ')
    db.prepare(`UPDATE production_log SET ${setClause} WHERE id = ?`).run(
      ...columns.map((c) => data[c]),
      id
    )
    return db.prepare('SELECT * FROM production_log WHERE id = ?').get(id)
  })

  ipcMain.handle('production:delete', (_, id) => {
    db.prepare('DELETE FROM production_log WHERE id = ?').run(id)
    return { deleted: true, id }
  })

  ipcMain.handle('production:search', (_, query) => {
    const q = `%${query}%`
    return db
      .prepare(
        `SELECT * FROM production_log
         WHERE item_name LIKE ? OR category LIKE ? OR sold_to LIKE ? OR entry_type LIKE ?
         ORDER BY created_at DESC`
      )
      .all(q, q, q, q)
  })

  ipcMain.handle('production:export', () => {
    const rows = db.prepare('SELECT * FROM production_log ORDER BY created_at DESC').all()
    const headers = ['Type', 'Item', 'Category', 'Quantity', 'Unit', 'Sold To', 'Created At']
    return toCsv(
      headers,
      rows.map((r) => [r.entry_type, r.item_name, r.category, r.quantity, r.unit, r.sold_to, r.created_at])
    )
  })
}
