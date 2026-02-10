<script setup lang="ts">
const isOpen = defineModel<boolean>()
const categoriesStore = useCategoriesStore()

const name = ref('')
const budgetLimit = ref<number | null>(null)
const loading = ref(false)

const isValid = computed(() => name.value.trim() && budgetLimit.value && budgetLimit.value > 0)

async function handleSubmit() {
  if (!isValid.value) return

  loading.value = true
  try {
    await categoriesStore.addCategory(name.value.trim(), budgetLimit.value!)
    name.value = ''
    budgetLimit.value = null
    isOpen.value = false
  } finally {
    loading.value = false
  }
}

function handleClose() {
  name.value = ''
  budgetLimit.value = null
  isOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal">
          <div class="modal__header">
            <h2>Новая статья расходов</h2>
            <button class="modal__close" @click="handleClose">
              <Icon name="lucide:x" size="24" />
            </button>
          </div>

          <form class="modal__form" @submit.prevent="handleSubmit">
            <div class="modal__field">
              <label>Название</label>
              <input
                v-model="name"
                type="text"
                class="input"
                placeholder="Продукты, Транспорт..."
                autocomplete="off"
              />
            </div>

            <div class="modal__field">
              <label>Бюджет на месяц (дин.)</label>
              <input
                v-model.number="budgetLimit"
                type="number"
                class="input"
                placeholder="30000"
                min="1"
                inputmode="numeric"
              />
            </div>

            <button
              type="submit"
              class="btn btn--primary btn--large"
              :disabled="!isValid || loading"
            >
              {{ loading ? 'Создание...' : 'Создать' }}
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
