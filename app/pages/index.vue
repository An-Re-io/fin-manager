<script setup lang="ts">
const categoriesStore = useCategoriesStore()
const settingsStore = useSettingsStore()

const showAddModal = ref(false)

onMounted(async () => {
  await settingsStore.loadSettings()
  await categoriesStore.loadCategories()
})

const totalBudget = computed(() =>
  categoriesStore.categories.reduce((sum, cat) => sum + cat.budgetLimit, 0)
)

const totalSpent = computed(() =>
  categoriesStore.categories.reduce((sum, cat) => sum + cat.spent, 0)
)
</script>

<template>
  <div class="home">
    <div class="container">
      <header class="home__header">
        <h1 class="home__title">Расходы</h1>
        <NuxtLink to="/settings" class="home__settings">
          <Icon name="lucide:settings" size="24" />
        </NuxtLink>
      </header>

      <div class="home__summary card">
        <div class="home__summary-row">
          <span>Потрачено</span>
          <span class="home__summary-value">{{ settingsStore.formatCurrency(totalSpent) }}</span>
        </div>
        <div class="home__summary-row">
          <span>Бюджет</span>
          <span>{{ settingsStore.formatCurrency(totalBudget) }}</span>
        </div>
      </div>

      <div class="home__categories">
        <CategoryCard
          v-for="category in categoriesStore.categories"
          :key="category.id"
          :id="category.id!"
          :name="category.name"
          :budget-limit="category.budgetLimit"
          :spent="category.spent"
        />

        <div v-if="categoriesStore.categories.length === 0" class="home__empty">
          <Icon name="lucide:wallet" size="48" />
          <p>Нет статей расходов</p>
          <p class="home__empty-hint">Нажмите + чтобы создать первую</p>
        </div>
      </div>

      <button class="home__add btn btn--primary btn--icon" @click="showAddModal = true">
        <Icon name="lucide:plus" size="28" />
      </button>
    </div>

    <AddCategoryModal v-model="showAddModal" />
  </div>
</template>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: 100px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg 0;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 700;
  }

  &__settings {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-full;
    background-color: $bg-card;
    transition: background-color $transition-fast;

    &:active {
      background-color: $bg-input;
    }
  }

  &__summary {
    margin-bottom: $spacing-lg;
  }

  &__summary-row {
    display: flex;
    justify-content: space-between;
    padding: $spacing-xs 0;
    color: $text-secondary;

    &:first-child {
      font-size: 1.1rem;
      color: $text-primary;
    }
  }

  &__summary-value {
    font-weight: 600;
  }

  &__categories {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__empty {
    text-align: center;
    padding: $spacing-xl * 2;
    color: $text-muted;

    p {
      margin-top: $spacing-md;
    }
  }

  &__empty-hint {
    font-size: 0.9rem;
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
