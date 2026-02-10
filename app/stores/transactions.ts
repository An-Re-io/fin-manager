import { defineStore } from 'pinia'
import type { Transaction, Currency } from '~/types'

export const useTransactionsStore = defineStore('transactions', () => {
  const db = useDatabase()
  const settingsStore = useSettingsStore()

  const transactions = ref<Transaction[]>([])
  const loading = ref(false)

  async function loadTransactions(categoryId: number) {
    loading.value = true
    try {
      transactions.value = await db.transactions
        .where('categoryId')
        .equals(categoryId)
        .reverse()
        .sortBy('createdAt')
    } finally {
      loading.value = false
    }
  }

  function convertToRSD(amount: number, currency: Currency): number {
    if (currency === 'RSD') return amount

    const rates = settingsStore.currencyRates
    if (currency === 'EUR') return Math.round(amount * rates.EUR)
    if (currency === 'RUB') return Math.round(amount * rates.RUB)

    return amount
  }

  async function addTransaction(
    categoryId: number,
    amount: number,
    currency: Currency,
    description: string
  ) {
    const amountInRSD = convertToRSD(amount, currency)

    const id = await db.transactions.add({
      categoryId,
      amount: amountInRSD,
      originalAmount: amount,
      originalCurrency: currency,
      description,
      createdAt: new Date()
    })

    await loadTransactions(categoryId)
    return id
  }

  async function deleteTransaction(id: number, categoryId: number) {
    await db.transactions.delete(id)
    await loadTransactions(categoryId)
  }

  return {
    transactions,
    loading,
    loadTransactions,
    addTransaction,
    deleteTransaction,
    convertToRSD
  }
})
