import { defineStore } from 'pinia'
import type { ExpenseCategory, Transaction, Currency } from '~/types'

interface CategoryWithSpent extends ExpenseCategory {
  spent: number
}

export const useCategoriesStore = defineStore('categories', () => {
  const db = useDatabase()

  const categories = ref<CategoryWithSpent[]>([])
  const loading = ref(false)

  async function loadCategories() {
    loading.value = true
    try {
      const cats = await db.categories.toArray()
      const transactions = await db.transactions.toArray()

      categories.value = cats.map(cat => ({
        ...cat,
        spent: transactions
          .filter(t => t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0)
      }))
    } finally {
      loading.value = false
    }
  }

  async function addCategory(name: string, budgetLimit: number) {
    const id = await db.categories.add({
      name,
      budgetLimit,
      createdAt: new Date()
    })
    await loadCategories()
    return id
  }

  async function updateCategory(id: number, data: Partial<ExpenseCategory>) {
    await db.categories.update(id, data)
    await loadCategories()
  }

  async function deleteCategory(id: number) {
    await db.transactions.where('categoryId').equals(id).delete()
    await db.categories.delete(id)
    await loadCategories()
  }

  async function getCategory(id: number): Promise<CategoryWithSpent | undefined> {
    const cat = await db.categories.get(id)
    if (!cat) return undefined

    const transactions = await db.transactions.where('categoryId').equals(id).toArray()
    const spent = transactions.reduce((sum, t) => sum + t.amount, 0)

    return { ...cat, spent }
  }

  return {
    categories,
    loading,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory
  }
})
