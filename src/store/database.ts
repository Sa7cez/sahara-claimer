import fs from 'fs'
import _ from 'lodash'
import { randomId } from '../helpers'
import path from 'path'
import Database from 'better-sqlite3'

type Row = {
  id: string
  data: string
  saved: number
}

export class SQLiteDatabase {
  private db: Database.Database
  private tableName: string

  constructor(tableName: string, dbName: string = 'db.sqlite') {
    // Ensure the stores directory exists
    const dbDir = path.join(process.cwd(), 'stores')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
      console.log(`Created directory: ${dbDir}`)
    }

    const dbPath = path.join(dbDir, dbName)
    // console.log(`Opening SQLite database at: ${dbPath}`)

    // Open database connection (synchronous)
    this.db = new Database(dbPath)
    this.tableName = tableName

    // Create table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        saved INTEGER
      )
    `)

    //console.log(`Connected to SQLite table: ${this.tableName}`)
  }

  init = () => {
    console.log(`Initialized SQLite store for table: ${this.tableName}`)
    const count = this.count()
    console.log(`Table ${this.tableName} has ${count} records`)
    return this
  }

  public count(): number {
    const result = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`).get() as { count: number }
    return result?.count || 0
  }

  public push(value: any): boolean {
    try {
      const id = randomId(12)
      const saved = Date.now()

      this.db.prepare(`INSERT INTO ${this.tableName} (id, data, saved) VALUES (?, ?, ?)`).run(id, JSON.stringify(value), saved)

      return true
    } catch (error) {
      console.error('Error pushing to database:', error)
      return false
    }
  }

  public last(): any {
    const row = this.db.prepare(`SELECT * FROM ${this.tableName} ORDER BY saved DESC LIMIT 1`).get() as Row
    if (!row) return null
    return { ...JSON.parse(row.data), id: row.id, saved: row.saved }
  }

  public random(): any {
    const row = this.db.prepare(`SELECT * FROM ${this.tableName} ORDER BY RANDOM() LIMIT 1`).get() as Row
    if (!row) return null
    return { ...JSON.parse(row.data), id: row.id, saved: row.saved }
  }

  public get(key: string): any {
    if (!key) return undefined

    let row = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(key) as Row

    if (!row) {
      row = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(key.toLowerCase()) as Row
    }

    if (!row) return null
    return { ...JSON.parse(row.data), id: row.id, saved: row.saved }
  }

  public delete(key: string | any): boolean {
    try {
      if (typeof key === 'string') {
        this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(key)
      } else {
        // If key is an object, we need to find matching records
        const rows = this.db.prepare(`SELECT id, data FROM ${this.tableName}`).all() as Row[]
        for (const row of rows) {
          const data = JSON.parse(row.data)
          if (_.isEqual(data, key)) {
            this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(row.id)
          }
        }
      }
      return true
    } catch (error) {
      console.error('Error deleting from database:', error)
      return false
    }
  }

  public set(key: string | undefined, value: any): boolean {
    if (!key) return false

    const cleared = _.cloneDeep(value)
    delete cleared.web
    delete cleared.viemClient
    delete cleared.account
    delete cleared.chain
    delete cleared.chain
    delete cleared.indexer
    delete cleared.spinner

    if (cleared?.user?.UserAddresses) delete cleared.user.UserAddresses
    delete cleared.transactions

    const saved = Date.now()

    try {
      // Check if record exists
      const exists = this.db.prepare(`SELECT 1 FROM ${this.tableName} WHERE id = ?`).get(key) as Row

      if (exists) {
        this.db.prepare(`UPDATE ${this.tableName} SET data = ?, saved = ? WHERE id = ?`).run(JSON.stringify(cleared), saved, key)
      } else {
        this.db.prepare(`INSERT INTO ${this.tableName} (id, data, saved) VALUES (?, ?, ?)`).run(key, JSON.stringify(cleared), saved)
      }

      return true
    } catch (error) {
      console.error('Error setting in database:', error)
      return false
    }
  }

  public searchByField(field: string, value: any): any[] {
    const rows = this.db.prepare(`SELECT id, data, saved FROM ${this.tableName}`).all() as Row[]
    const results = []

    for (const row of rows) {
      const data = JSON.parse(row.data)
      if (data[field] === value) {
        results.push({ ...data, id: row.id, saved: row.saved })
      }
    }

    return results
  }

  public all(values: boolean = true): any {
    const rows = this.db.prepare(`SELECT id, data, saved FROM ${this.tableName}`).all() as Row[]

    if (values) {
      return rows.map((row) => ({ ...JSON.parse(row.data), id: row.id, saved: row.saved }))
    } else {
      // Convert to object with ids as keys
      return rows.reduce((acc: { [key: string]: any }, row) => {
        acc[row.id] = { ...JSON.parse(row.data), saved: row.saved }
        return acc
      }, {}) as { [key: string]: any }
    }
  }

  public find(field: string, value: any): any {
    const results = this.searchByField(field, value)
    return results[0] || null
  }

  public close(): void {
    if (this.db) {
      this.db.close()
      console.log('SQLite connection closed')
    }
  }
}

// For backward compatibility
export class LocalJsonDatabase {
  private filename: string
  private data: { [key: string]: any }

  constructor(filename: string) {
    this.filename = filename
    this.data = {}

    if (fs.existsSync(filename)) {
      const fileData = fs.readFileSync(filename, 'utf-8')
      try {
        this.data = JSON.parse(fileData)
        // console.log(`initialize ${filename} store`)
      } catch (error) {
        // console.error(`Saving JSON error ${filename}:`, error)
      }
    }
  }

  static init = () => {
    console.log(`initialize store`)
  }

  public count(): number {
    return Object.keys(this.data).length
  }

  public push(value: any): boolean {
    this.data[randomId(12)] = value
    return this.saveDataToFile()
  }

  public last(): any {
    return Object.values(this.data)[this.count() - 1]
  }

  public random(): any {
    return Object.values(this.data).sort(() => (Math.random() > 0.5 ? 1 : -1))[0]
  }

  public get(key: string): any {
    if (!key) return undefined
    return this.data[key] || this.data[key.toLowerCase()]
  }

  public delete(key: string | any): any {
    if (typeof key === 'string') delete this.data[key]
    else
      Object.entries(this.data).map(([existKey, value]) => {
        if (value === key) delete this.data[existKey]
      })
    return this.saveDataToFile()
  }

  public set(key: string | undefined, value: any): boolean {
    if (!key) return false

    const cleared = _.cloneDeep(value)
    delete cleared.web
    delete cleared.viemClient
    delete cleared.account
    delete cleared.chain
    delete cleared.chain
    delete cleared.indexer
    if (cleared?.user?.UserAddresses) delete cleared.user.UserAddresses
    delete cleared.transactions

    cleared.saved = Date.now()

    this.data[key] = cleared
    return this.saveDataToFile()
  }

  public searchByField(field: string, value: any): any[] {
    const results = []
    for (const key in this.data) {
      if (this.data.hasOwnProperty(key)) {
        if (this.data[key][field] === value) {
          results.push(this.data[key])
        }
      }
    }
    return results
  }

  public all(values: boolean = true): any {
    return values ? Object.values(this.data) : this.data
  }

  public find(field: string, value: any): any {
    return this.searchByField(field, value)[0]
  }

  private saveDataToFile(): boolean {
    const jsonData = JSON.stringify(this.data, null, 2)
    const tempFilename = `${this.filename}.temp`

    try {
      fs.writeFileSync(tempFilename, jsonData, 'utf-8')
      fs.renameSync(tempFilename, this.filename)
      return true
    } catch (error) {
      console.error('Error on save:', error)
      return false
    }
  }
}

export default SQLiteDatabase
