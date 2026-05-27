<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { useArticleId } from '@/api/article.api'
import ArticleForm from '@/components/article/article-form.vue'

const route = useRoute()
const { t } = useI18n()
const articleId = computed(() => route.params.id as string | null)

const { data: article, isLoading } = useArticleId(articleId)
</script>

<template>
  <div class="p-6">
    <div v-if="isLoading">{{ t('article.loading') }}</div>
    <ArticleForm v-else :key="article?.id" :article="article" />
  </div>
</template>
