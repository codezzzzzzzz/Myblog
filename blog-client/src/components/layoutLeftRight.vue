<template>
  <div class="layout">
    <div class="left">
      <slot name="left"></slot>
    </div>
    <div class="right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="less" scoped>
.layout{
  padding: 26px 104px 48px 104px;
  background-color: #F9FAFB;
  display: flex;
  min-height: calc(100vh - 210px);
  .left{
    flex: 1;
    margin-right: 32px;
  }
  .right{
    flex: 0 0 390px;
  }
}
</style>