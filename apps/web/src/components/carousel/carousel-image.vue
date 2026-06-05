<template>
  <Carousel v-bind="config">
    <Slide v-for="image in images" :key="image.key">
      <img alt="image" :src="image.url" />
    </Slide>
    <Navigation />
    <Pagination />
  </Carousel>
</template>

<script lang="ts" setup>
import 'vue3-carousel/carousel.css'

import type { TrpcOutput } from '@iut-intranet/trpc'
import { Carousel, Slide } from 'vue3-carousel'

type HighlightList = TrpcOutput['highlight']['list']

defineProps<{
  images: HighlightList
}>()

const config = {
  autoplay: 1500,
  itemsToShow: 2.5,
  pauseAutoplayOnHover: true,
  wrapAround: true,
}
</script>
