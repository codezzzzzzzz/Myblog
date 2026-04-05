<template>
  <div class="blog-conclude">
    <layoutLeftRight>
      <template v-slot:left>
        <div class="conclude-content__left">
          <div class="card">
            <div class="title">归档</div>
            <p class="desc">按时间整理的全部文章</p>
          </div>
          <div class="archive-list" v-if="archiveGroups.length">
            <div class="group" v-for="(items, key) in archiveGroups" :key="key">
              <div class="group-title">{{ key.replace('-', '年') }}月</div>
              <ul class="article-list">
                <li v-for="item in items" :key="item.id">
                  <span class="date">{{ formateDate(item.create_time) }}</span>
                  <router-link :to="{ path: '/detail', query: { id: item.id } }">{{ item.title }}</router-link>
                </li>
              </ul>
            </div>
          </div>
          <div class="empty" v-else-if="!loading">
            <p>暂无文章</p>
          </div>
          <div class="loading" v-else>加载中...</div>
        </div>
      </template>
      <template v-slot:right>
        <div class="conclude-model__right">
          <Category />
          <Callme class="mt32" />
        </div>
      </template>
    </layoutLeftRight>
  </div>
</template>

<script setup>
import layoutLeftRight from '@/components/layoutLeftRight.vue'
import Category from '@/components/Category.vue'
import Callme from '@/components/Callme.vue'
import { getArchiveList } from '@/api/index.js'
import { formateDate } from '@/utils/formateDate.js'
import { onMounted, ref, computed } from 'vue'

const archiveList = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getArchiveList()
    archiveList.value = res.data || []
  } finally {
    loading.value = false
  }
})

// 按 年-月 分组，如 "2025-01"
const archiveGroups = computed(() => {
  const list = archiveList.value
  if (!list.length) return {}
  const map = {}
  list.forEach((item) => {
    const d = item.create_time != null ? new Date(/^\d+$/.test(String(item.create_time)) ? Number(item.create_time) : item.create_time) : null
    if (!d || isNaN(d.getTime())) return
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map[key]) map[key] = []
    map[key].push(item)
  })
  // 键排序倒序（新的在前）
  const keys = Object.keys(map).sort((a, b) => b.localeCompare(a))
  const result = {}
  keys.forEach((k) => { result[k] = map[k] })
  return result
})
</script>

<style lang="less" scoped>
.blog-conclude {
  .conclude-content__left {
    .card {
      padding: 24px;
      background-color: #fff;
      border-radius: 8px;
      margin-bottom: 32px;
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #000;
        line-height: 28px;
        margin-bottom: 8px;
      }
      .desc {
        font-size: 16px;
        color: #4B5563;
        line-height: 24px;
      }
    }
    .archive-list {
      .group {
        margin-bottom: 32px;
        .group-title {
          font-size: 18px;
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #E5E7EB;
        }
        .article-list {
          list-style: none;
          padding: 0;
          margin: 0;
          li {
            display: flex;
            align-items: center;
            padding: 10px 0;
            font-size: 14px;
            border-bottom: 1px solid #F3F4F6;
            .date {
              flex: 0 0 100px;
              color: #6B7280;
            }
            a {
              flex: 1;
              color: #374151;
              &:hover {
                color: #8E6FF7;
              }
            }
          }
        }
      }
    }
    .empty,
    .loading {
      padding: 48px;
      text-align: center;
      color: #6B7280;
    }
  }
  @media screen and (max-width: 1200px) {
    .conclude-model__right {
      display: none;
    }
  }
}
</style>
