<template>
  <div class="layout">
    <div class="layout__main">
      <slot name="left"></slot>
    </div>
    <aside v-if="slots.right" class="layout__aside">
      <slot name="right"></slot>
    </aside>
  </div>
</template>

<script setup>
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<style lang="less" scoped>
@bp-stack: 1024px;

.layout {
  padding: 26px var(--layout-page-pad) 48px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: stretch;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-height: calc(100vh - var(--header-h) - var(--footer-h) - 48px);
}

.layout__main {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.layout__aside {
  flex-shrink: 0;
  width: 100%;
}

@media (min-width: @bp-stack) {
  .layout {
    flex-direction: row;
    align-items: flex-start;
    gap: 32px;
  }

  .layout__main {
    flex: 1;
    margin-right: 0;
  }

  .layout__aside {
    width: min(390px, 34vw);
    flex: 0 0 min(390px, 34vw);
    position: sticky;
    top: calc(var(--header-h) + 16px);
    align-self: flex-start;
    max-height: calc(100vh - var(--header-h) - 32px);
    overflow-y: auto;
  }
}
</style>
