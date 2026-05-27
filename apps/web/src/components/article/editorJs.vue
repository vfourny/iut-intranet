<script lang="ts" setup>
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import type { EditorJsContent } from '@iut-intranet/helpers/types/article'
import { nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue'

const props = defineProps<{
  modelValue?: EditorJsContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: EditorJsContent]
}>()

const editorRef = ref<HTMLDivElement>()
const editor = ref<EditorJS | null>(null)
let isInternalChange = false

onMounted(async () => {
  editor.value = new EditorJS({
    data: props.modelValue ? toRaw(props.modelValue) : undefined,
    holder: editorRef.value,
    minHeight: 0,
    onChange: async (api) => {
      isInternalChange = true
      const data = await api.saver.save()
      emit('update:modelValue', data as EditorJsContent)
      nextTick(() => {
        isInternalChange = false
      })
    },
    tools: {
      header: {
        class: Header,
        config: {
          defaultLevel: 2,
          levels: [1, 2, 3],
        },
      },
      list: {
        class: List,
        inlineToolbar: true,
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
      },
    },
  })
})

onBeforeUnmount(async () => {
  await editor.value?.isReady
  editor.value?.destroy()
  editor.value = null
})

watch(
  () => props.modelValue,
  async (value) => {
    if (!editor.value || !value || isInternalChange) return
    await editor.value.isReady
    await editor.value.render(toRaw(value))
  },
)
</script>

<template>
  <div ref="editorRef" @keydown.shift.exact.stop @keydown.space.exact.stop />
</template>
