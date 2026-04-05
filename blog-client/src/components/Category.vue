<template>
  <div class="category">
    <div class="title">文章分类</div>
    <ul class="category-list">
      <li class="item" v-for="item in categoryList" :key="item.id">
        <span>{{item.name}}({{item.article_count}})</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { getAllArticleCategory } from '@/api/index.js';
import { onMounted, ref } from 'vue';

const categoryList = ref([]);

onMounted(async () => {
  const res = await getAllArticleCategory();
  console.log(res);
  categoryList.value = res.data;
});
</script>

<style lang="less" scoped>
.category{
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px;
  .title{
    font-weight: 600;
    font-size: 18px;
    color: #000000;
    line-height: 28px;
    margin-bottom: 12px;
  }
  .category-list{
    overflow: hidden;
    .item{
      float: left;
      margin: 4px;
      overflow: auto;
      span{
        display: block;
        font-weight: 400;
        font-size: 14px;
        color: #4B5563;
        line-height: 20px;
        padding: 4px 12px;
        background: #F3F4F6;
        border-radius: 100px;
      }
    }
  }
}
</style>