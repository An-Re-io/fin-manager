import type { ExpenseCategory, Transaction, Settings } from '~/types'

interface BackupData {
  version: number
  exportedAt: string
  categories: ExpenseCategory[]
  transactions: Transaction[]
  settings: {
    currencyRates: {
      EUR: number
      RUB: number
    }
  }
}

export function useBackup() {
  const db = useDatabase()

  async function exportData(): Promise<BackupData> {
    const categories = await db.categories.toArray()
    const transactions = await db.transactions.toArray()
    const settings = await db.settings.get(1)

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      categories,
      transactions,
      settings: {
        currencyRates: settings?.currencyRates || { EUR: 117, RUB: 1.15 }
      }
    }
  }

  async function downloadBackup() {
    const data = await exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const date = new Date().toISOString().split('T')[0]
    const filename = `finance-backup-${date}.json`

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function importData(data: BackupData) {
    if (!data.version || !data.categories || !data.transactions) {
      throw new Error('Неверный формат файла бекапа')
    }

    // Очищаем текущие данные
    await db.transactions.clear()
    await db.categories.clear()

    // Импортируем категории (без id, чтобы создались новые)
    const categoryIdMap = new Map<number, number>()

    for (const cat of data.categories) {
      const oldId = cat.id!
      const newId = await db.categories.add({
        name: cat.name,
        budgetLimit: cat.budgetLimit,
        createdAt: new Date(cat.createdAt)
      })
      categoryIdMap.set(oldId, newId as number)
    }

    // Импортируем транзакции с обновленными categoryId
    for (const tx of data.transactions) {
      const newCategoryId = categoryIdMap.get(tx.categoryId)
      if (newCategoryId) {
        await db.transactions.add({
          categoryId: newCategoryId,
          amount: tx.amount,
          originalAmount: tx.originalAmount,
          originalCurrency: tx.originalCurrency,
          description: tx.description,
          createdAt: new Date(tx.createdAt)
        })
      }
    }

    // Импортируем настройки
    if (data.settings?.currencyRates) {
      await db.settings.update(1, {
        currencyRates: data.settings.currencyRates
      })
    }
  }

  function readFileAsJson(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          resolve(data)
        } catch {
          reject(new Error('Ошибка чтения JSON файла'))
        }
      }
      reader.onerror = () => reject(new Error('Ошибка чтения файла'))
      reader.readAsText(file)
    })
  }

  async function importFromFile(file: File) {
    const data = await readFileAsJson(file)
    await importData(data)
  }

  return {
    exportData,
    downloadBackup,
    importData,
    importFromFile
  }
}
