import Dexie, { type EntityTable } from 'dexie'
import type { ExpenseCategory, Transaction, Settings } from '~/types'

class FinanceDatabase extends Dexie {
  categories!: EntityTable<ExpenseCategory, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor() {
    super('FinanceManager')

    this.version(1).stores({
      categories: '++id, name, createdAt',
      transactions: '++id, categoryId, createdAt',
      settings: '++id'
    })
  }
}

const db = new FinanceDatabase()

export function useDatabase() {
  return db
}
