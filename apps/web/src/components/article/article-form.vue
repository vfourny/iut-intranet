<script lang="ts" setup>
import { ArticleStatus, DepartmentCode } from '@iut-intranet/db/enums'
import type { Article } from '@iut-intranet/helpers/types/article'
import PrimeDatePicker from 'primevue/datepicker'
import PrimeMultiSelect from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'
import { computed, ref, toRaw } from 'vue'

import { useCreateArticle, useUpdateArticles } from '@/api/article.api'
import { useMe } from '@/api/users.api'
import EditorJs from '@/components/article/editorJs.vue'
import { useI18n } from '@/composables/use-i18n'
import { RouteNames, router } from '@/router'

const props = defineProps<{
  article?: Article
}>()

const isLoading = ref(false)
const { t } = useI18n()
const toast = useToast()
const { data: me } = useMe()

const { mutateAsync: createArticle } = useCreateArticle()
const { mutateAsync: updateArticle } = useUpdateArticles()

const isUpdate = computed(() => !!props.article)

const departmentOptions = Object.values(DepartmentCode).map((code) => ({
  label: code,
  value: code,
}))

const form = ref<{
  content: Article['content'] | undefined
  coverUrl: string
  publishedAt: Date | null
  status: ArticleStatus
  targetDepartmentIds: string[]
  title: string
}>({
  content: props.article?.content,
  coverUrl: props.article?.coverUrl ?? '',
  publishedAt: props.article?.publishedAt ?? null,
  status: props.article?.status ?? ArticleStatus.DRAFT,
  targetDepartmentIds:
    props.article?.targetDepartments.map((d) => d.code) ?? [],
  title: props.article?.title ?? '',
})

const isPublishedAtDisabled = computed(() => {
  if (!isUpdate.value) return true
  return form.value.status === 'DRAFT' || form.value.status === 'PUBLISHED'
})

const onSubmit = async () => {
  if (!me.value?.id) return
  if (!form.value.title) return
  if (!form.value.content) return
  if (isUpdate.value && !form.value.status) return

  try {
    isLoading.value = true
    if (isUpdate.value && props.article) {
      await updateArticle({
        articleId: props.article.id,
        content: form.value.content,
        coverUrl: form.value.coverUrl || undefined,
        publishedAt:
          form.value.status === 'SCHEDULED'
            ? form.value.publishedAt
            : form.value.status === 'PUBLISHED'
              ? (props.article.publishedAt ?? new Date())
              : null,
        status: form.value.status,
        targetDepartmentIds: toRaw(form.value.targetDepartmentIds),
        title: form.value.title,
      })
    } else {
      await createArticle({
        authorId: me.value.id,
        content: form.value.content,
        coverUrl: form.value.coverUrl || undefined,
        createAt: new Date(),
        targetDepartmentIds: toRaw(form.value.targetDepartmentIds),
        title: form.value.title,
        updateAt: new Date(),
      })
    }
    toast.add({
      life: 3000,
      severity: 'success',
      summary: t('article.create.succes'),
    })
    router.push({ name: RouteNames.article.news })
  } catch {
    toast.add({
      life: 5000,
      severity: 'error',
      summary: t('article.create.fail'),
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <label for="title">{{ t('article.form.title') }}</label>
      <PrimeInputText
        id="title"
        v-model="form.title"
        :placeholder="t('article.form.title')"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label>{{ t('article.form.content') }}</label>
      <div class="min-h-48 rounded-lg border border-surface-200 px-4 py-2">
        <EditorJs v-model="form.content" />
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <label for="coverUrl">{{ t('article.form.coverUrl') }}</label>
      <PrimeInputText
        id="coverUrl"
        v-model="form.coverUrl"
        :placeholder="t('article.form.coverUrl')"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label for="targetDepartments">{{
        t('article.form.targetDepartments')
      }}</label>
      <PrimeMultiSelect
        v-model="form.targetDepartmentIds"
        option-label="label"
        option-value="value"
        :options="departmentOptions"
        :placeholder="t('article.form.targetDepartments')"
      />
    </div>

    <template v-if="isUpdate">
      <div class="flex flex-col gap-1">
        <label for="status">{{ t('article.form.status') }}</label>
        <PrimeSelect
          id="status"
          v-model="form.status"
          :options="['DRAFT', 'PUBLISHED', 'SCHEDULED']"
          :placeholder="t('article.form.status')"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="publishedAt">{{ t('article.form.publishedAt') }}</label>
        <PrimeDatePicker
          id="publishedAt"
          v-model="form.publishedAt"
          date-format="dd/mm/yy"
          :disabled="isPublishedAtDisabled"
          show-button-bar
          show-time
        />
      </div>
    </template>

    <PrimeButton
      :label="t('article.saveArticle')"
      :loading="isLoading"
      type="button"
      @click="onSubmit"
    />
  </div>
</template>
