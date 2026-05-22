<script setup lang="ts">
import Toast from 'primevue/toast'

import { useMe } from '@/api/users.api'
import HeaderInformationsProfil from '@/components/profil/header-informations-profil.vue'

const { data: me } = useMe()
</script>

<template>
  <div>
    <Toast />
    <HeaderInformationsProfil v-if="me" :user="me" />
  </div>
</template>
