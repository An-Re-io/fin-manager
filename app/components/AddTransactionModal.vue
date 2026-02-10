<script setup lang="ts">
import type { Currency } from '~/types'

const props = defineProps<{
  categoryId: number
}>()

const isOpen = defineModel<boolean>()
const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()

const amount = ref<number | null>(null)
const description = ref('')
const currency = ref<Currency>('RSD')
const loading = ref(false)

const currencies: { value: Currency; label: string }[] = [
  { value: 'RSD', label: 'Динары' },
  { value: 'EUR', label: 'Евро' },
  { value: 'RUB', label: 'Рубли' }
]

const isValid = computed(() => amount.value && amount.value > 0 && description.value.trim())

async function handleSubmit() {
  if (!isValid.value) return

  loading.value = true
  try {
    await transactionsStore.addTransaction(
      props.categoryId,
      amount.value!,
      currency.value,
      description.value.trim()
    )
    await categoriesStore.loadCategories()
    resetForm()
    isOpen.value = false
  } finally {
    loading.value = false
  }
}

function resetForm() {
  amount.value = null
  description.value = ''
  currency.value = 'RSD'
}

function handleClose() {
  resetForm()
  isOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal">
          <div class="modal__header">
            <h2>Новый расход</h2>
            <button class="modal__close" @click="handleClose">
              <Icon name="lucide:x" size="24" />
            </button>
          </div>

          <form class="modal__form" @submit.prevent="handleSubmit">
            <div class="modal__field">
              <label>Сумма</label>
              <div class="modal__amount-row">
                <input
                  v-model.number="amount"
                  type="number"
                  class="input"
                  placeholder="0"
                  min="1"
                  inputmode="decimal"
                />
                <div class="modal__currency-selector">
                  <button
                    v-for="c in currencies"
                    :key="c.value"
                    type="button"
                    class="modal__currency-btn"
                    :class="{ 'modal__currency-btn--active': currency === c.value }"
                    @click="currency = c.value"
                  >
                    {{ c.value }}
                  </button>
                </div>
              </div>
            </div>

            <div class="modal__field">
              <label>Описание</label>
              <input
                v-model="description"
                type="text"
                class="input"
                placeholder="На что потратили?"
                autocomplete="off"
              />
            </div>

            <button
              type="submit"
              class="btn btn--primary btn--large"
              :disabled="!isValid || loading"
            >
              {{ loading ? 'Добавление...' : 'Добавить' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 100;
  padding: $spacing-md;
}

.modal {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background-color: $bg-card;
  border-radius: $radius-lg $radius-lg 0 0;
  padding: $spacing-lg;
  padding-bottom: calc($spacing-lg + env(safe-area-inset-bottom));

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
    }
  }

  &__close {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-full;
    color: $text-secondary;

    &:active {
      background-color: $bg-input;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    label {
      font-size: 0.9rem;
      color: $text-secondary;
    }
  }

  &__amount-row {
    display: flex;
    gap: $spacing-sm;

    .input {
      flex: 1;
    }
  }

  &__currency-selector {
    display: flex;
    background-color: $bg-input;
    border-radius: $radius-md;
    padding: 4px;
  }

  &__currency-btn {
    padding: $spacing-sm $spacing-md;
    border-radius: $radius-sm;
    font-size: 0.85rem;
    font-weight: 500;
    color: $text-secondary;
    transition: all $transition-fast;

    &--active {
      background-color: $primary;
      color: white;
    }
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;

  .modal {
    transition: transform 200ms ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal {
    transform: translateY(100%);
  }
}
</style>
