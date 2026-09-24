import { ipcMain } from 'electron'
import { getDb } from '../db/database.js'
import { toCsv } from '../utils/exportCsv.js'

export function registerStallSalesHandlers() {
  const db = getDb()

  ipcMain.handle('stallSales:list', () =>
    db.prepare('SELECT * FROM stall_sales ORDER BY created_at DESC').all()
  )

  ipcMain.handle('stallSales:get', (_, id) =>
    db.prepare('SELECT * FROM stall_sales WHERE id = ?').get(id)
  )

  ipcMain.handle('stallSales:create', (_, data) => {
    const amount = (data.rate || 0) * (data.quantity || 0)
    return db.prepare(`
      INSERT INTO stall_sales
        (date, product_name, customer_name, rate, quantity,
         amount, contact_no, stall_name, location, created_at)
      VALUES
        (@date, @product_name, @customer_name, @rate, @quantity,
         @amount, @contact_no, @stall_name, @location, @created_at)
    `).run({
      ...data,
      amount,
      created_at: new Date().toISOString()
    }).lastInsertRowid
  })

  ipcMain.handle('stallSales:update', (_, id, data) => {
    const amount = (data.rate || 0) * (data.quantity || 0)
    return db.prepare(`
      UPDATE stall_sales SET
        date          = @date,
        product_name  = @product_name,
        customer_name = @customer_name,
        rate          = @rate,
        quantity      = @quantity,
        amount        = @amount,
        contact_no    = @contact_no,
        stall_name    = @stall_name,
        location      = @location
      WHERE id = @id
    `).run({ ...data, amount, id })
  })

  ipcMain.handle('stallSales:delete', (_, id) =>
    db.prepare('DELETE FROM stall_sales WHERE id = ?').run(id)
  )

  ipcMain.handle('stallSales:search', (_, query) => {
    const q = `%${query}%`
    return db.prepare(`
      SELECT * FROM stall_sales
      WHERE product_name  LIKE ?
         OR customer_name LIKE ?
         OR stall_name    LIKE ?
         OR location      LIKE ?
      ORDER BY created_at DESC
    `).all(q, q, q, q)
  })

  ipcMain.handle('stallSales:export', () => {
    const rows = db.prepare(
      'SELECT * FROM stall_sales ORDER BY created_at DESC'
    ).all()
    const headers = [
      'Date','Product','Customer','Rate',
      'Qty','Amount','Contact','Stall','Location'
    ]
    return toCsv(headers, rows.map(r => [
      r.date, r.product_name, r.customer_name,
      r.rate, r.quantity, r.amount,
      r.contact_no, r.stall_name, r.location
    ]))
  })
}