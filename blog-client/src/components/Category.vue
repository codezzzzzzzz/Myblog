<template>
  <div class="category">
    <template v-if="loading">
      <el-skeleton animated :throttle="{ leading: 0 }">
        <template #template>
          <el-skeleton-item variant="h3" class="sk-cat-title" />
          <div class="sk-cat-tags">
            <el-skeleton-item v-for="i in 8" :key="i" variant="button" class="sk-cat-chip" />
          </div>
        </template>
      </el-skeleton>
    </template>
    <template v-else>
      <div class="title">文章分类</div>
      <ul class="category-list">
        <li class="item" v-for="item in categoryList" :key="item.id">
          <span>{{ item.name }}({{ item.article_count }})</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { getAllArticleCategory } from '@/api/index.js'
import { onMounted, ref } from 'vue'

const categoryList = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getAllArticleCategory()
    console.log(res)
    categoryList.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<style lang="less" scoped>
.sk-cat-title {
  width: 100px !important;
  height: 24px !important;
  margin-bottom: 14px !important;
}
.sk-cat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sk-cat-chip {
  width: 72px !important;
  height: 28px !important;
}

.category {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  background: var(--soft-surface-raised);
  border-radius: 0;
  border: 3px solid var(--px-ink);
  box-shadow: var(--nu-raised);
  .title {
    font-weight: 700;
    font-size: 18px;
    color: var(--soft-text);
    line-height: 28px;
    margin-bottom: 14px;
    font-family: var(--font-display);
  }
  .category-list {
    overflow: hidden;
    .item {
      float: left;
      margin: 6px;
      overflow: auto;
      span {
        display: block;
        font-weight: 800;
        font-size: 13px;
        color: var(--px-ink);
        line-height: 20px;
        padding: 6px 12px;
        background: var(--soft-accent-2);
        border-radius: var(--soft-radius-pill);
        border: 2px solid var(--px-ink);
        box-shadow: 2px 2px 0 var(--px-ink);
        transition: transform var(--transition-soft), box-shadow var(--transition-soft);
        cursor: default;
      }
    }
  }
}
</style>
