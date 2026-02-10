<script setup lang="ts">
import type { Transaction } from '~/types'

const props = defineProps<{
  transaction: Transaction
  categoryId: number
}>()

const transactionsStore = useTransactionsStore()
const settingsStore = useSettingsStore()

const showDeleteConfirm = ref(false)

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleDelete() {
  await transactionsStore.deleteTransaction(props.transaction.id!, props.categoryId)
}
</script>

<template>
  <div class="transaction">
    <div class="transaction__info">
      <span class="transaction__description">{{ transaction.description }}</span>
      <span class="transaction__date">{{ formatDate(transaction.createdAt) }}</span>
    </div>
    <div class="transaction__amount">
      <span class="transaction__value">-{{ settingsStore.formatCurrency(transaction.amount) }}</span>
      <span v-if="transaction.originalCurrency !== 'RSD'" class="transaction__original">
        {{ transaction.originalAmount }} {{ transaction.originalCurrency }}
      </span>
    </div>
    <button class="transaction__delete" @click="showDeleteConfirm = true">
      <Icon name="lucide:x" size="18" />
    </button>

    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Удалить транзакцию?"
      :message="transaction.description"
      confirm-text="Удалить"
      @confirm="handleDelete"
    />
  </div>
</template>

<style lang="scss" scoped>
.transaction {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__description {
    display: block;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date {
    font-size: 0.8rem;
    color: $text-muted;
  }

  &__amount {
    text-align: right;
  }

  &__value {
    display: block;
    font-weight: 600;
    color: $danger;
  }

  &__original {
    font-size: 0.75rem;
    color: $text-muted;
  }

  &__delete {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-full;
    color: $text-muted;
    flex-shrink: 0;

    &:active {
      background-color: $bg-input;
      color: $danger;
    }
  }
}
</style>
