export type Currency = 'RSD' | 'EUR' | 'RUB'

export interface Transaction {
  id?: number
  categoryId: number
  amount: number
  originalAmount: number
  originalCurrency: Currency
  description: string
  createdAt: Date
}

export interface ExpenseCategory {
  id?: number
  name: string
  budgetLimit: number
  createdAt: Date
}

export interface CurrencyRates {
  EUR: number
  RUB: number
}

export interface Settings {
  id?: number
  currencyRates: CurrencyRates
}
