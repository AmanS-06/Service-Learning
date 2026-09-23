import { ipcMain } from 'electron'
import { getDb } from '../db/database.js'

const FIELDS = [
  'name', 'age', 'education_qualification', 'sex', 'occupation',
  'contact_no', 'alternate_contact_no', 'income_before_lp', 'income_after_lp',
  'address', 'associated_before_lp', 'year', 'courses_completed', 'course_names',
  'joining_date', 'work_experience', 'skills', 'aadhar_pan', 'work_profile',
  'expert', 'designation', 'reporting_to'
]

export function registerBeneficiaryHandlers() {
  ipcMain.handle('beneficiary:list', () => {
    const db = getDb()
    return db.prepare('SELECT * FROM beneficiaries ORDER BY id DESC').all()
  })

  ipcMain.handle('beneficiary:get', (_event, id) => {
    const db = getDb()
    return db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(id)
  })

  ipcMain.handle('beneficiary:create', (_event, data) => {
    const db = getDb()
    const columns = FIELDS.filter((f) => data[f] !== undefined)
    const placeholders = columns.map(() => '?').join(', ')
    const stmt = db.prepare(
      `INSERT INTO beneficiaries (${columns.join(', ')}, created_at) VALUES (${placeholders}, datetime('now'))`
    )
    const result = stmt.run(...columns.map((c) => data[c]))
    return db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('beneficiary:update', (_event, id, data) => {
    const db = getDb()
    const columns = FIELDS.filter((f) => data[f] !== undefined)
    const setClause = columns.map((c) => `${c} = ?`).join(', ')
    const stmt = db.prepare(`UPDATE beneficiaries SET ${setClause} WHERE id = ?`)
    stmt.run(...columns.map((c) => data[c]), id)
    return db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(id)
  })

  ipcMain.handle('beneficiary:delete', (_event, id) => {
    const db = getDb()
    db.prepare('DELETE FROM beneficiaries WHERE id = ?').run(id)
    return { deleted: true, id }
  })

  ipcMain.handle('beneficiary:search', (_event, query) => {
    const db = getDb()
    const like = `%${query}%`
    return db
      .prepare(
        `SELECT * FROM beneficiaries
         WHERE name LIKE ? OR contact_no LIKE ? OR occupation LIKE ? OR designation LIKE ?
         ORDER BY id DESC`
      )
      .all(like, like, like, like)
  })

  ipcMain.handle('beneficiary:export', () => {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM beneficiaries ORDER BY id ASC').all()
    return rows
  })
}