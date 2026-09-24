import { getDb } from './database.js'

// Call seedIfEmpty() once from main/index.js (after app is ready) if you want
// sample rows to develop against. It's a no-op once production_log has data.
export function seedIfEmpty() {
  const db = getDb()
  const { c } = db.prepare('SELECT COUNT(*) as c FROM production_log').get()
  if (c > 0) return

  const insert = db.prepare(`
    INSERT INTO production_log (entry_type, item_name, category, quantity, unit, sold_to, created_at)
    VALUES (@entry_type, @item_name, @category, @quantity, @unit, @sold_to, @created_at)
  `)

  const now = () => new Date().toISOString()

  const rows = [
    { entry_type: 'MANUFACTURING', item_name: 'Jute Tote Bag', category: 'Bags',    quantity: 50, unit: 'pcs', sold_to: null,             created_at: now() },
    { entry_type: 'MANUFACTURING', item_name: 'Cotton Scarf',  category: 'Apparel', quantity: 30, unit: 'pcs', sold_to: null,             created_at: now() },
    { entry_type: 'SELL',          item_name: 'Jute Tote Bag', category: 'Bags',    quantity: 12, unit: 'pcs', sold_to: 'Local Boutique', created_at: now() }
  ]

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row)
  })
  insertMany(rows)
}
