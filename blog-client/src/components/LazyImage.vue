<template>
  <div
    class="lazy-img"
    :class="{ 'lazy-img--loaded': loaded && !error, 'lazy-img--error': error }"
  >
    <template v-if="src">
      <div v-if="!loaded" class="lazy-img__skeleton" aria-hidden="true" />
      <img
        :src="src"
        :alt="alt"
        :class="['lazy-img__img', imgClass]"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        :fetchpriority="eager ? 'high' : 'auto'"
        @load="onLoad"
        @error="onError"
      />
    </template>
    <div v-else class="lazy-img__nosrc" aria-hidden="true" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  /** 首屏/LCP 关键图用 true，其余用懒加载 */
  eager: { type: Boolean, default: false },
  imgClass: { type: String, default: '' }
})

const loaded = ref(false)
const error = ref(false)

function onLoad() {
  loaded.value = true
}

function onError() {
  error.value = true
  loaded.value = true
}

watch(
  () => props.src,
  (s) => {
    error.value = false
    if (!s) {
      loaded.value = true
    } else {
      loaded.value = false
    }
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
.lazy-img {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--soft-surface, #e8ecf3);
}

.lazy-img__skeleton {
  position: absolute;
  inset: 0;
  z-index: 1;
  border: 2px solid var(--px-ink, #2d2541);
  background: linear-gradient(
    110deg,
    var(--soft-read, #fffcef) 0%,
    rgba(255, 182, 232, 0.35) 40%,
    var(--soft-read, #fffcef) 80%
  );
  background-size: 200% 100%;
  animation: lazy-img-shimmer 1.2s ease-in-out infinite;
}

.lazy-img__nosrc {
  width: 100%;
  height: 100%;
  min-height: 48px;
  background: var(--soft-surface, #e8ecf3);
  border: 2px dashed var(--px-ink-mid, #4a3d6b);
}

.lazy-img__img {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 0.28s ease;
}

.lazy-img--loaded .lazy-img__img {
  opacity: 1;
}

.lazy-img--loaded .lazy-img__skeleton {
  display: none;
}

.lazy-img--error .lazy-img__skeleton {
  display: none;
}

.lazy-img--error .lazy-img__img {
  display: none;
}

@keyframes lazy-img-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lazy-img__skeleton {
    animation: none;
    background: var(--soft-read, #fffcef);
  }
}
</style>
