import { defineStore } from 'pinia'
import type { CurrencyRates } from '~/types'

const DEFAULT_RATES: CurrencyRates = {
  EUR: 117,
  RUB: 1.15
}

export const useSettingsStore = defineStore('settings', () => {
  const db = useDatabase()

  const currencyRates = ref<CurrencyRates>({ ...DEFAULT_RATES })
  const loading = ref(false)

  async function loadSettings() {
    loading.value = true
    try {
      const settings = await db.settings.get(1)
      if (settings) {
        currencyRates.value = settings.currencyRates
      } else {
        await db.settings.add({
          id: 1,
          currencyRates: DEFAULT_RATES
        })
      }
    } finally {
      loading.value = false
    }
  }

  async function updateRates(rates: CurrencyRates) {
    currencyRates.value = rates
    await db.settings.update(1, { currencyRates: rates })
  }

  function formatCurrency(amount: number, currency: 'RSD' | 'EUR' | 'RUB' = 'RSD'): string {
    const symbols: Record<string, string> = {
      RSD: 'дин.',
      EUR: '€',
      RUB: '₽'
    }
    return `${amount.toLocaleString('ru-RU')} ${symbols[currency]}`
  }

  return {
    currencyRates,
    loading,
    loadSettings,
    updateRates,
    formatCurrency
  }
})
