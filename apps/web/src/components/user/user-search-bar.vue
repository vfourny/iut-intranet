<script setup lang="ts">
import PrimeInputText from 'primevue/inputtext'
import { ref } from 'vue'

import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()

const emit = defineEmits<{
  search: [name: string]
}>()

const searchQuery = ref('')

const onSearch = () => {
  emit('search', searchQuery.value)
}
</script>

<template>
  <PrimeInputText
    v-model="searchQuery"
    :placeholder="t('user.search')"
    type="text"
    @input="onSearch"
  />
</template>
