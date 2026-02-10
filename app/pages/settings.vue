<script setup lang="ts">
const settingsStore = useSettingsStore()
const categoriesStore = useCategoriesStore()
const backup = useBackup()

const eurRate = ref(settingsStore.currencyRates.EUR)
const rubRate = ref(settingsStore.currencyRates.RUB)
const saving = ref(false)
const exporting = ref(false)
const importing = ref(false)
const importError = ref('')
const importSuccess = ref(false)
const showImportConfirm = ref(false)
const pendingFile = ref<File | null>(null)

const fileInput = ref<HTMLInputElement>()

watch(() => settingsStore.currencyRates, (rates) => {
  eurRate.value = rates.EUR
  rubRate.value = rates.RUB
}, { immediate: true })

async function handleSave() {
  saving.value = true
  try {
    await settingsStore.updateRates({
      EUR: eurRate.value,
      RUB: rubRate.value
    })
  } finally {
    saving.value = false
  }
}

const hasChanges = computed(() =>
  eurRate.value !== settingsStore.currencyRates.EUR ||
  rubRate.value !== settingsStore.currencyRates.RUB
)

async function handleExport() {
  exporting.value = true
  try {
    await backup.downloadBackup()
  } finally {
    exporting.value = false
  }
}

function triggerFileSelect() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    pendingFile.value = file
    showImportConfirm.value = true
  }
  input.value = ''
}

async function confirmImport() {
  if (!pendingFile.value) return

  importing.value = true
  importError.value = ''
  importSuccess.value = false

  try {
    await backup.importFromFile(pendingFile.value)
    await settingsStore.loadSettings()
    await categoriesStore.loadCategories()
    eurRate.value = settingsStore.currencyRates.EUR
    rubRate.value = settingsStore.currencyRates.RUB
    importSuccess.value = true
    setTimeout(() => {
      importSuccess.value = false
    }, 3000)
  } catch (e) {
    importError.value = e instanceof Error ? e.message : 'Ошибка импорта'
  } finally {
    importing.value = false
    pendingFile.value = null
    showImportConfirm.value = false
  }
}
</script>

<template>
  <div class="settings">
    <div class="container">
      <header class="page-header">
        <NuxtLink to="/" class="page-header__back">
          <Icon name="lucide:arrow-left" size="20" />
        </NuxtLink>
        <h1 class="page-header__title">Настройки</h1>
      </header>

      <section class="settings__section">
        <h2 class="settings__section-title">Курсы валют</h2>
        <p class="settings__section-hint">Курс к сербскому динару (RSD)</p>

        <div class="settings__rates">
          <div class="settings__rate">
            <label>1 EUR =</label>
            <div class="settings__rate-input">
              <input
                v-model.number="eurRate"
                type="number"
                class="input"
                min="1"
                step="0.01"
                inputmode="decimal"
              />
              <span>RSD</span>
            </div>
          </div>

          <div class="settings__rate">
            <label>1 RUB =</label>
            <div class="settings__rate-input">
              <input
                v-model.number="rubRate"
                type="number"
                class="input"
                min="0.01"
                step="0.01"
                inputmode="decimal"
              />
              <span>RSD</span>
            </div>
          </div>
        </div>

        <button
          class="btn btn--primary btn--large"
          :disabled="!hasChanges || saving"
          @click="handleSave"
        >
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </section>

      <section class="settings__section">
        <h2 class="settings__section-title">Резервное копирование</h2>
        <p class="settings__section-hint">Экспорт и импорт данных в JSON</p>

        <div class="settings__backup-actions">
          <button
            class="btn settings__backup-btn"
            :disabled="exporting"
            @click="handleExport"
          >
            <Icon name="lucide:download" size="20" />
            {{ exporting ? 'Экспорт...' : 'Экспортировать' }}
          </button>

          <button
            class="btn settings__backup-btn"
            :disabled="importing"
            @click="triggerFileSelect"
          >
            <Icon name="lucide:upload" size="20" />
            {{ importing ? 'Импорт...' : 'Импортировать' }}
          </button>

          <input
            ref="fileInput"
            type="file"
            accept=".json"
            class="settings__file-input"
            @change="handleFileSelect"
          />
        </div>

        <div v-if="importError" class="settings__message settings__message--error">
          {{ importError }}
        </div>

        <div v-if="importSuccess" class="settings__message settings__message--success">
          Данные успешно импортированы
        </div>
      </section>

      <section class="settings__section">
        <h2 class="settings__section-title">О приложении</h2>
        <p class="settings__about">
          Финансовый менеджер для учета повседневных расходов.
          Данные хранятся локально на устройстве.
        </p>
      </section>
    </div>

    <ConfirmModal
      v-model="showImportConfirm"
      title="Импортировать данные?"
      message="Текущие данные будут заменены данными из файла"
      confirm-text="Импортировать"
      @confirm="confirmImport"
    />
  </div>
</template>

<style lang="scss" scoped>
.settings {
  min-height: 100vh;
  min-height: 100dvh;

  &__section {
    margin-bottom: $spacing-xl;
  }

  &__section-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: $spacing-xs;
  }

  &__section-hint {
    font-size: 0.85rem;
    color: $text-muted;
    margin-bottom: $spacing-md;
  }

  &__rates {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  &__rate {
    label {
      display: block;
      font-size: 0.9rem;
      color: $text-secondary;
      margin-bottom: $spacing-xs;
    }
  }

  &__rate-input {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    .input {
      flex: 1;
    }

    span {
      color: $text-secondary;
      font-weight: 500;
    }
  }

  &__backup-actions {
    display: flex;
    gap: $spacing-sm;
  }

  &__backup-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    padding: $spacing-md;
    background-color: $bg-card;
    border-radius: $radius-md;
    font-weight: 500;
    transition: background-color $transition-fast;

    &:active {
      background-color: $bg-input;
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  &__file-input {
    display: none;
  }

  &__message {
    margin-top: $spacing-md;
    padding: $spacing-md;
    border-radius: $radius-md;
    font-size: 0.9rem;

    &--error {
      background-color: rgba($danger, 0.15);
      color: $danger;
    }

    &--success {
      background-color: rgba($success, 0.15);
      color: $success;
    }
  }

  &__about {
    color: $text-secondary;
    font-size: 0.95rem;
    line-height: 1.5;
  }
}
</style>
