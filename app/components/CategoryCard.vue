<script setup lang="ts">
interface Props {
  id: number
  name: string
  budgetLimit: number
  spent: number
}

const props = defineProps<Props>()
const settingsStore = useSettingsStore()

const percentage = computed(() => {
  if (props.budgetLimit === 0) return 0
  return Math.min((props.spent / props.budgetLimit) * 100, 100)
})

const remaining = computed(() => props.budgetLimit - props.spent)

const status = computed(() => {
  if (percentage.value >= 100) return 'danger'
  if (percentage.value >= 80) return 'warning'
  return 'normal'
})
</script>

<template>
  <NuxtLink :to="`/category/${id}`" class="category-card">
    <div class="category-card__header">
      <span class="category-card__name">{{ name }}</span>
      <span class="category-card__remaining" :class="`category-card__remaining--${status}`">
        {{ settingsStore.formatCurrency(remaining) }}
      </span>
    </div>

    <div class="category-card__progress">
      <div
        class="category-card__progress-bar"
        :class="`category-card__progress-bar--${status}`"
        :style="{ width: `${percentage}%` }"
      />
    </div>

    <div class="category-card__footer">
      <span class="category-card__spent">{{ settingsStore.formatCurrency(spent) }}</span>
      <span class="category-card__limit">из {{ settingsStore.formatCurrency(budgetLimit) }}</span>
    </div>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.category-card {
  display: block;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md;
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.98);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-sm;
  }

  &__name {
    font-weight: 600;
    font-size: 1.1rem;
  }

  &__remaining {
    font-weight: 500;
    font-size: 0.9rem;

    &--normal {
      color: $success;
    }

    &--warning {
      color: $warning;
    }

    &--danger {
      color: $danger;
    }
  }

  &__progress {
    height: 8px;
    background-color: $bg-input;
    border-radius: $radius-full;
    overflow: hidden;
    margin-bottom: $spacing-sm;
  }

  &__progress-bar {
    height: 100%;
    border-radius: $radius-full;
    transition: width $transition-normal;

    &--normal {
      background: linear-gradient(90deg, $success, lighten($success, 10%));
    }

    &--warning {
      background: linear-gradient(90deg, $warning, lighten($warning, 10%));
    }

    &--danger {
      background: linear-gradient(90deg, $danger, lighten($danger, 10%));
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: $text-secondary;
  }
}
</style>
