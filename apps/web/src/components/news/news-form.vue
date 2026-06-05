<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <label for="title">{{ t('news.form.title') }}</label>
      <PrimeInputText
        id="title"
        v-model="form.title"
        :placeholder="t('news.form.title')"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label>{{ t('news.form.content') }}</label>
      <PrimeEditor v-model="form.content" editor-style="height: 16rem" />
    </div>

    <div class="flex flex-col gap-1">
      <label>{{ t('news.form.coverUrl') }}</label>
      <img
        v-if="coverPreview"
        :alt="t('news.form.coverUrl')"
        class="h-48 w-full rounded-lg object-cover"
        :src="coverPreview"
      />
      <PrimeFileUpload
        accept="image/jpeg,image/png,image/webp"
        auto
        :choose-label="t('news.form.chooseCover')"
        custom-upload
        :max-file-size="MAX_UPLOAD_BYTES"
        mode="basic"
        @uploader="onCoverUpload"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label for="targetDepartments">{{
        t('news.form.targetDepartments')
      }}</label>
      <PrimeMultiSelect
        v-model="form.targetDepartmentCodes"
        option-label="label"
        option-value="value"
        :options="departmentOptions"
        :placeholder="t('news.form.targetDepartments')"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label for="status">{{ t('news.form.status') }}</label>
      <PrimeSelect
        id="status"
        v-model="form.status"
        :options="['DRAFT', 'PUBLISHED', 'SCHEDULED']"
        :placeholder="t('news.form.status')"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label for="publishedAt">{{ t('news.form.publishedAt') }}</label>
      <PrimeDatePicker
        id="publishedAt"
        v-model="form.publishedAt"
        date-format="dd/mm/yy"
        :disabled="isPublishedAtDisabled"
        show-button-bar
        show-time
      />
    </div>

    <div class="flex justify-end gap-2">
      <PrimeButton
        :label="t('news.cancel')"
        severity="secondary"
        text
        type="button"
        @click="emit('cancel')"
      />
      <PrimeButton
        :label="t('news.saveNews')"
        :loading="isLoading"
        type="button"
        @click="onSubmit"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DepartmentCode,NewsStatus } from '@iut-intranet/db/enums'
import { newsIdSchema } from '@iut-intranet/helpers/schemas/brand'
import type { UploadFileInput } from '@iut-intranet/helpers/schemas/storage'
import { MAX_UPLOAD_BYTES } from '@iut-intranet/helpers/schemas/storage'
import PrimeDatePicker from 'primevue/datepicker'
import PrimeEditor from 'primevue/editor'
import type { FileUploadUploaderEvent } from 'primevue/fileupload'
import PrimeFileUpload from 'primevue/fileupload'
import PrimeMultiSelect from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'
import { computed, ref, toRaw } from 'vue'

import { type News, useCreateNews, useUpdateNews } from '@/api/news.api'
import { useMe } from '@/api/users.api'
import { useI18n } from '@/composables/use-i18n'
import { fileToUploadInput } from '@/lib/file'

const props = defineProps<{
  news?: News
}>()

const emit = defineEmits<{
  cancel: []
  saved: []
}>()

const isLoading = ref(false)
const { t } = useI18n()
const toast = useToast()
const { data: me } = useMe()

const { mutateAsync: createNews } = useCreateNews()
const { mutateAsync: updateNews } = useUpdateNews()

const isUpdate = computed(() => !!props.news)

const departmentOptions = Object.values(DepartmentCode).map((code) => ({
  label: code,
  value: code,
}))

const form = ref<{
  content: string
  publishedAt: Date | null
  status: NewsStatus
  targetDepartmentCodes: string[]
  title: string
}>({
  content: props.news?.content ?? '',
  publishedAt: props.news?.publishedAt ?? null,
  status: props.news?.status ?? NewsStatus.DRAFT,
  targetDepartmentCodes:
    props.news?.targetDepartments.map((d) => d.code) ?? [],
  title: props.news?.title ?? '',
})

// Fichier de couverture envoyé avec la news : `undefined` = inchangée, un
// fichier = nouvelle couverture (uploadée côté serveur au create/update). La
// news chargée expose une URL signée (non réutilisable en écriture), on ne
// porte donc un fichier qu'après une sélection explicite.
const coverFile = ref<UploadFileInput | undefined>(undefined)
// Prévisualisation : URL signée existante, puis objet local après sélection.
const coverPreview = ref<string | null>(props.news?.coverUrl ?? null)

const onCoverUpload = async (event: FileUploadUploaderEvent) => {
  const file = Array.isArray(event.files) ? event.files[0] : event.files
  if (!file) return

  const contentType = file.type
  if (
    contentType !== 'image/jpeg' &&
    contentType !== 'image/png' &&
    contentType !== 'image/webp'
  ) {
    return
  }

  try {
    coverFile.value = await fileToUploadInput(file)
    coverPreview.value = URL.createObjectURL(file)
  } catch {
    toast.add({
      life: 5000,
      severity: 'error',
      summary: t('news.coverUploadFail'),
    })
  }
}

// La date n'est saisissable que pour une news programmée : un brouillon n'en a
// pas et une publication immédiate la fige sur « maintenant » à l'envoi.
const isPublishedAtDisabled = computed(
  () => form.value.status === 'DRAFT' || form.value.status === 'PUBLISHED',
)

const onSubmit = async () => {
  if (!me.value?.id) return
  if (isUpdate.value && !form.value.status) return
  // Titre et contenu ne sont requis qu'à la publication/programmation : un
  // brouillon peut rester incomplet (la couverture, elle, est toujours libre).
  const isPublishing =
    form.value.status === 'PUBLISHED' || form.value.status === 'SCHEDULED'
  if (isPublishing && !form.value.title.trim()) {
    toast.add({
      life: 5000,
      severity: 'error',
      summary: t('news.titleRequired'),
    })
    return
  }
  if (isPublishing && !form.value.content.trim()) {
    toast.add({
      life: 5000,
      severity: 'error',
      summary: t('news.contentRequired'),
    })
    return
  }

  try {
    isLoading.value = true
    if (isUpdate.value && props.news) {
      await updateNews({
        content: form.value.content,
        cover: coverFile.value,
        // L'id chargé (cuid) est brandé en `NewsId` par parse, sans cast.
        newsId: newsIdSchema.parse(props.news.id),
        publishedAt:
          form.value.status === 'SCHEDULED'
            ? form.value.publishedAt
            : form.value.status === 'PUBLISHED'
              ? (props.news.publishedAt ?? new Date())
              : null,
        status: form.value.status,
        targetDepartmentCodes: toRaw(form.value.targetDepartmentCodes),
        title: form.value.title,
      })
    } else {
      await createNews({
        content: form.value.content,
        cover: coverFile.value,
        publishedAt:
          form.value.status === 'SCHEDULED'
            ? form.value.publishedAt
            : form.value.status === 'PUBLISHED'
              ? new Date()
              : null,
        status: form.value.status,
        targetDepartmentCodes: toRaw(form.value.targetDepartmentCodes),
        title: form.value.title,
      })
    }
    toast.add({
      life: 3000,
      severity: 'success',
      summary: t('news.create.succes'),
    })
    emit('saved')
  } catch {
    toast.add({
      life: 5000,
      severity: 'error',
      summary: t('news.create.fail'),
    })
  } finally {
    isLoading.value = false
  }
}
</script>
