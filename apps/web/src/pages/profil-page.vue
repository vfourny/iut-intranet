<template>
  <div>
    <HeaderInformationsProfil v-if="me" :user="me" />
  </div>
</template>

<script setup lang="ts">
import { useMe } from '@/api/users.api'
import HeaderInformationsProfil from '@/components/profil/header-informations-profil.vue'

const { data: me } = useMe()
</script>
