<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const settingsStore = useSettingsStore()

const categoryId = computed(() => Number(route.params.id))
const category = ref<Awaited<ReturnType<typeof categoriesStore.getCategory>>>()
const showAddModal = ref(false)
const showDeleteConfirm = ref(false)

async function loadData() {
  category.value = await categoriesStore.getCategory(categoryId.value)
  if (!category.value) {
    router.push('/')
    return
  }
  await transactionsStore.loadTransactions(categoryId.value)
}

onMounted(loadData)

watch(() => transactionsStore.transactions, async () => {
  category.value = await categoriesStore.getCategory(categoryId.value)
}, { deep: true })

async function handleDeleteCategory() {
  await categoriesStore.deleteCategory(categoryId.value)
  router.push('/')
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}
</script>

<template>
  <div class="category-page">
    <div class="container">
      <header class="page-header">
        <NuxtLink to="/" class="page-header__back">
          <Icon name="lucide:arrow-left" size="20" />
        </NuxtLink>
        <h1 class="page-header__title">{{ category?.name }}</h1>
        <button class="page-header__action" @click="showDeleteConfirm = true">
          <Icon name="lucide:trash-2" size="20" />
        </button>
      </header>

      <div v-if="category" class="category-page__summary card">
        <div class="category-page__progress">
          <div
            class="category-page__progress-bar"
            :style="{ width: `${Math.min((category.spent / category.budgetLimit) * 100, 100)}%` }"
          />
        </div>
        <div class="category-page__amounts">
          <div>
            <span class="category-page__label">Потрачено</span>
            <span class="category-page__value">{{ settingsStore.formatCurrency(category.spent) }}</span>
          </div>
          <div>
            <span class="category-page__label">Осталось</span>
            <span class="category-page__value category-page__value--remaining">
              {{ settingsStore.formatCurrency(category.budgetLimit - category.spent) }}
            </span>
          </div>
        </div>
      </div>

      <h2 class="category-page__section-title">Транзакции</h2>

      <div class="category-page__transactions">
        <TransactionItem
          v-for="transaction in transactionsStore.transactions"
          :key="transaction.id"
          :transaction="transaction"
          :category-id="categoryId"
        />

        <div v-if="transactionsStore.transactions.length === 0" class="category-page__empty">
          <p>Нет транзакций</p>
        </div>
      </div>

      <button class="category-page__add btn btn--primary btn--icon" @click="showAddModal = true">
        <Icon name="lucide:plus" size="28" />
      </button>
    </div>

    <AddTransactionModal v-model="showAddModal" :category-id="categoryId" />

    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Удалить статью?"
      message="Все транзакции в этой статье также будут удалены"
      confirm-text="Удалить"
      @confirm="handleDeleteCategory"
    />
  </div>
</template>

<style lang="scss" scoped>
.category-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: 100px;

  .page-header__action {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-full;
    color: $danger;
    background-color: $bg-card;

    &:active {
      background-color: $bg-input;
    }
  }

  &__summary {
    margin-bottom: $spacing-lg;
  }

  &__progress {
    height: 8px;
    background-color: $bg-input;
    border-radius: $radius-full;
    overflow: hidden;
    margin-bottom: $spacing-md;
  }

  &__progress-bar {
    height: 100%;
    background: linear-gradient(90deg, $primary, lighten($primary, 10%));
    border-radius: $radius-full;
    transition: width $transition-normal;
  }

  &__amounts {
    display: flex;
    justify-content: space-between;

    > div {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
    }
  }

  &__label {
    font-size: 0.85rem;
    color: $text-secondary;
  }

  &__value {
    font-size: 1.25rem;
    font-weight: 600;

    &--remaining {
      color: $success;
    }
  }

  &__section-title {
    font-size: 1rem;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: $spacing-md;
  }

  &__transactions {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__empty {
    text-align: center;
    padding: $spacing-xl;
    color: $text-muted;
  }

  &__add {
    position: fixed;
    bottom: $spacing-lg;
    right: $spacing-lg;
    width: 56px;
    height: 56px;
    box-shadow: 0 4px 20px rgba($primary, 0.4);
  }
}
</style>
