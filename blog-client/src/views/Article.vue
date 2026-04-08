<template>
  <div class="article">
    <div class="title">{{ listTitle }}</div>
    <LayoutLeftRight>
      <template v-slot:left>
        <template v-if="listLoading && articleList.length === 0">
          <div v-for="n in 5" :key="'sk-' + n" class="arcitle-card arcitle-card--skeleton">
            <el-skeleton animated :throttle="{ leading: 0 }">
              <template #template>
                <div class="sk-article-row">
                  <el-skeleton-item variant="image" class="sk-article-thumb" />
                  <div class="sk-article-text">
                    <el-skeleton-item variant="h1" class="sk-article-h1" />
                    <el-skeleton-item variant="text" class="sk-line" />
                    <el-skeleton-item variant="text" class="sk-line sk-line--wide" />
                  </div>
                </div>
                <el-skeleton-item variant="text" class="sk-line sk-line--short" />
              </template>
            </el-skeleton>
          </div>
        </template>
        <template v-else>
        <div class="arcitle-card" @click="goDetail(item.id)" v-for="(item, idx) in articleList" :key="item.id">
          <div class="card-body">
            <div v-if="item.cover_pic" class="cover-thumb">
              <LazyImage
                :src="resolveMediaUrl(item.cover_pic)"
                :alt="item.title || ''"
                :eager="idx < 3"
              />
            </div>
            <div class="card-text">
              <div class="name">{{ item.title }}</div>
              <div class="desc">
                {{ item.article_desc }}
              </div>
            </div>
          </div>
          <div class="control">
            <div class="control-left">
              <div class="item">
                <i class="iconfont icon-rili"></i>
                <span>{{ formateDate(item.create_time) }}</span>
              </div>
              <div class="item">
                <i class="iconfont icon-yueduliang"></i>
                <span>{{ item.read }}阅读 </span>
              </div>
              <div class="item">
                <i class="iconfont icon-dianzan"></i>
                <span>{{ item.like_num }}点赞</span>
              </div>
            </div>
            <div class="control-right">
              <div 
                v-if="item.tag_names"
                class="tag" 
                v-for="tag in item.tag_names.split(', ')"  
                :key="tag"
                :style="{ background: randomColor(150, 250), color: randomColor(0, 100) }"
              >
                {{tag}}
              </div>
            </div>
          </div>
        </div>
        </template>
      </template>

      <template v-slot:right>
        <Category />
        <Callme class="mt32" />
      </template>

    </LayoutLeftRight>
  </div>
</template>

<script setup>
import LayoutLeftRight from '@/components/layoutLeftRight.vue'
import Category from '@/components/Category.vue';
import Callme from '@/components/Callme.vue'
import LazyImage from '@/components/LazyImage.vue'
import { randomColor } from '@/utils/randomColor.js'
import { getAllArticleList } from '@/api/index.js'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formateDate } from '@/utils/formateDate.js'
import { resolveMediaUrl } from '@/utils/mediaUrl.js'

const route = useRoute()
const articleList = ref([])
const totalPage = ref(0)
const page = ref(1)
const size = 5
const listLoading = ref(true)

function searchKeyword() {
  const q = route.query.q
  return typeof q === 'string' ? q.trim() : ''
}

const listTitle = computed(() => {
  const k = searchKeyword()
  return k ? `搜索结果：${k}` : '最新文章'
})

const getData = async () => {
  try {
    const kw = searchKeyword()
    const res = await getAllArticleList({
      page: page.value,
      size,
      q: kw || undefined
    })
    articleList.value = [...articleList.value, ...res.data]
    totalPage.value = res.totalPage
  } finally {
    listLoading.value = false
  }
}

function resetListAndFetch() {
  articleList.value = []
  page.value = 1
  totalPage.value = 0
  listLoading.value = true
  getData()
}

watch(
  () => route.query.q,
  () => {
    resetListAndFetch()
  }
)

onMounted(() => {
  getData()
})

// 下一页
// 监听滚动事件，判断是否滚动到底部
window.addEventListener('scroll', function () {
  // 获取视口高度
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  // 获取文档总高度
  const docHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
  // 获取当前滚动位置
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

  // 判断是否触底
  if (scrollPosition + windowHeight >= docHeight) {
    // console.log('滚动到底部');
    // 在这里可以执行加载更多数据等操作
    getNextPage()
  }
})


const getNextPage = () => {
  if (page.value >= totalPage.value) { // 已经是最后一页了
    return
  }
  page.value++
  getData()
}

const router = useRouter()
const goDetail = (id) => {
  router.push({ path: '/detail', query: { id } })
}

</script>

<style lang="less" scoped>
.article {
  background: transparent;

  .sk-article-row {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
    align-items: flex-start;
  }
  .sk-article-thumb {
    width: 200px !important;
    height: 120px !important;
    flex-shrink: 0;
  }
  .sk-article-text {
    flex: 1;
    min-width: 0;
  }
  .sk-article-h1 {
    width: 85% !important;
    margin-bottom: 14px !important;
  }
  .sk-line {
    width: 100% !important;
    margin-bottom: 8px !important;
  }
  .sk-line--wide {
    width: 92% !important;
  }
  .sk-line--short {
    width: 60% !important;
  }
  .arcitle-card--skeleton {
    cursor: default;
    pointer-events: none;
    &:hover {
      transform: none;
      box-shadow: var(--nu-raised);
    }
  }

  .title {
    font-weight: 700;
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    color: var(--soft-text);
    line-height: 1.2;
    padding: 24px var(--layout-page-pad) 8px;
    font-family: var(--font-display);
  }

  .arcitle-card {
    width: 100%;
    background: var(--soft-read-solid);
    padding: 24px;
    box-sizing: border-box;
    border-radius: 0;
    border: 3px solid var(--px-ink);
    box-shadow: var(--nu-raised);
    margin-bottom: 28px;
    cursor: pointer;
    transition: box-shadow var(--transition-soft), transform var(--transition-soft);

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        box-shadow: var(--nu-hover);
        transform: translate(-2px, -2px);
      }
    }

    &:active {
      transform: translate(2px, 2px);
      box-shadow: var(--nu-pressed);
    }

    .card-body {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .cover-thumb {
      flex-shrink: 0;
      width: 200px;
      height: 120px;
      border-radius: 0;
      overflow: hidden;
      border: 2px solid var(--px-ink);
      background: var(--soft-surface);
      box-shadow: 2px 2px 0 var(--px-ink);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        pointer-events: none;
      }
    }

    .card-text {
      flex: 1;
      min-width: 0;
    }

    .name {
      font-weight: 700;
      font-size: clamp(1.35rem, 2.5vw, 1.75rem);
      color: var(--soft-text);
      line-height: 1.25;
      margin-bottom: 14px;
      font-family: var(--font-display);
    }

    .desc {
      font-weight: 500;
      font-size: 17px;
      color: var(--soft-text-muted);
      line-height: 28px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .control {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;

      .control-left {
        display: flex;
        color: var(--soft-text-muted);
        font-weight: 500;
        font-size: 14px;
        align-items: center;

        .item {
          margin-right: 16px;

          .iconfont {
            color: var(--soft-accent);
            margin-right: 5px;
          }
        }
      }

      .control-right {
        display: flex;
        align-items: center;
        flex-wrap: wrap;

        .tag {
          padding: 5px 12px;
          border-radius: var(--soft-radius-pill);
          font-weight: 600;
          font-size: 13px;
          margin-left: 8px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .article {
    .sk-article-row {
      flex-direction: column;
      align-items: stretch;
    }
    .sk-article-thumb {
      width: 100% !important;
      height: 180px !important;
      max-height: 48vw;
    }

    .arcitle-card {
      padding: 18px;

      .card-body {
        flex-direction: column;
        align-items: stretch;
        margin-bottom: 18px;
      }

      .cover-thumb {
        width: 100%;
        height: 180px;
        max-height: 48vw;
      }

      .name {
        font-size: 1.2rem;
      }

      .desc {
        font-size: 15px;
        line-height: 24px;
        -webkit-line-clamp: 3;
      }

      .control {
        flex-direction: column;
        align-items: flex-start;

        .control-left {
          flex-wrap: wrap;
        }

        .control-right .tag {
          margin-left: 0;
          margin-right: 8px;
          margin-top: 4px;
        }
      }
    }
  }
}
</style>