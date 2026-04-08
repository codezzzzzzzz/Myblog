<template>
  <div class="footer">
    © 2024 TechBlog. All rights reserved. 
  </div>
</template>

<script setup>

</script>

<style lang="less" scoped>
.footer {
  min-height: var(--footer-h);
  line-height: 1.5;
  padding: 14px var(--layout-page-pad);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  background: var(--soft-surface-raised);
  font-weight: 500;
  font-size: clamp(12px, 2.8vw, 14px);
  color: var(--soft-text-muted);
  border-top: 4px solid var(--px-ink);
  box-shadow: 0 -4px 0 var(--px-ink-mid);
  border-radius: 0;
}
</style>