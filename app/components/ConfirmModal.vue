<script setup lang="ts">
const props = defineProps<{
  title: string
  message: string
  confirmText?: string
}>()

const emit = defineEmits<{
  confirm: []
}>()

const isOpen = defineModel<boolean>()

function handleConfirm() {
  emit('confirm')
  isOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
        <div class="confirm-modal">
          <h2 class="confirm-modal__title">{{ title }}</h2>
          <p class="confirm-modal__message">{{ message }}</p>

          <div class="confirm-modal__actions">
            <button class="btn confirm-modal__cancel" @click="isOpen = false">
              Отмена
            </button>
            <button class="btn btn--danger" @click="handleConfirm">
              {{ confirmText || 'Подтвердить' }}
            </button>
          </div>
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
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: $spacing-md;
}

.confirm-modal {
  width: 100%;
  max-width: 320px;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  text-align: center;

  &__title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: $spacing-sm;
  }

  &__message {
    color: $text-secondary;
    margin-bottom: $spacing-lg;
    font-size: 0.95rem;
  }

  &__actions {
    display: flex;
    gap: $spacing-sm;
  }

  &__cancel {
    flex: 1;
    padding: $spacing-md;
    background-color: $bg-input;
    border-radius: $radius-md;

    &:active {
      opacity: 0.8;
    }
  }

  .btn--danger {
    flex: 1;
    padding: $spacing-md;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;

  .confirm-modal {
    transition: transform 200ms ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .confirm-modal {
    transform: scale(0.9);
  }
}
</style>
