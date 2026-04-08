<template>
  <div class="blog-home">
    <layoutLeftRight>
      <template v-slot:left>
        <div class="home-content__left">
          <template v-if="homeLoading">
            <div class="home-skeleton-user">
              <el-skeleton animated :throttle="{ leading: 0 }">
                <template #template>
                  <div class="sk-user-row">
                    <el-skeleton-item variant="image" class="sk-user-avatar" />
                    <div class="sk-user-text">
                      <el-skeleton-item variant="h3" class="sk-line-title" />
                      <el-skeleton-item variant="text" class="sk-line" />
                      <el-skeleton-item variant="text" class="sk-line sk-line--short" />
                      <div class="sk-tags">
                        <el-skeleton-item variant="button" class="sk-tag" />
                        <el-skeleton-item variant="button" class="sk-tag" />
                      </div>
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </div>
            <div class="news-article">
              <el-skeleton animated :throttle="{ leading: 0 }" class="sk-news-title-wrap">
                <template #template>
                  <el-skeleton-item variant="h3" class="sk-news-title" />
                </template>
              </el-skeleton>
              <div class="article-list article-list--skeleton">
                <div v-for="n in 4" :key="'sk-' + n" class="article-item article-item--skeleton">
                  <el-skeleton animated :throttle="{ leading: 0 }">
                    <template #template>
                      <el-skeleton-item variant="image" class="sk-card-cover" />
                      <div class="sk-card-body">
                        <el-skeleton-item variant="h3" class="sk-card-title" />
                        <el-skeleton-item variant="text" class="sk-line" />
                        <el-skeleton-item variant="text" class="sk-line sk-line--mid" />
                        <el-skeleton-item variant="text" class="sk-line sk-line--short" />
                      </div>
                    </template>
                  </el-skeleton>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="user-info">
              <div class="avatar">
                <img
                  :src="DEFAULT_AVATAR_URL"
                  alt="头像"
                  width="80"
                  height="80"
                  loading="eager"
                  decoding="async"
                  fetchpriority="low"
                >
              </div>
              <div class="user-desc">
                <p class="name">阿炜</p>
                <p class="describle">全栈开发工程师，专注于 Web 开发和人工智能技术，热爱分享技术经验和学习心得。</p>
                <p class="tag">
                  <span>前端开发</span>
                  <span>人工智能</span>
                  <span>Python</span>
                </p>
              </div>
            </div>
            <div class="news-article">
              <div class="title">最新文章</div>
              <div class="article-list">
                <div
                  class="article-item"
                  v-for="(item, idx) in newsArticleList"
                  :key="item.id"
                  @click="$router.push({ path: '/detail', query: { id: item.id } })"
                >
                  <div class="article-pic">
                    <LazyImage
                      :src="resolveMediaUrl(item.cover_pic)"
                      :alt="item.title || '文章封面'"
                      :eager="idx < 2"
                    />
                  </div>
                  <div class="article-desc">
                    <div class="name">{{ item.title }}</div>
                    <div class="introduce">{{ item.article_desc }}</div>
                    <div class="time">
                      <span>{{ formateDate(item.create_time) }}</span>
                      <router-link :to="{ path: '/detail', query: { id: item.id } }" @click.stop>阅读更多</router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <template v-slot:right>
        <div class="home-model__right">
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
import LazyImage from '@/components/LazyImage.vue'
import { getNewsArticleList } from '@/api/index.js'
import { onMounted, ref } from 'vue'
import { formateDate } from '@/utils/formateDate.js'
import { DEFAULT_AVATAR_URL, resolveMediaUrl } from '@/utils/mediaUrl.js'

const newsArticleList = ref([])
const homeLoading = ref(true)

onMounted(async () => {
  try {
    const res = await getNewsArticleList()
    newsArticleList.value = res.data || []
  } finally {
    homeLoading.value = false
  }
})
</script>

<style lang="less" scoped>
.sk-user-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.sk-user-avatar {
  width: 80px !important;
  height: 80px !important;
  flex-shrink: 0;
}
.sk-user-text {
  flex: 1;
  padding-top: 4px;
}
.sk-line-title {
  width: 120px !important;
  margin-bottom: 12px !important;
}
.sk-line {
  width: 100% !important;
  margin-bottom: 8px !important;
}
.sk-line--mid {
  width: 90% !important;
}
.sk-line--short {
  width: 50% !important;
}
.sk-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.sk-tag {
  width: 72px !important;
  height: 28px !important;
}
.sk-news-title-wrap {
  margin-bottom: 20px;
}
.sk-news-title {
  width: 140px !important;
  height: 24px !important;
}
.sk-card-cover {
  width: 100% !important;
  height: 192px !important;
}
.sk-card-body {
  padding: 22px;
}
.sk-card-title {
  width: 70% !important;
  margin-bottom: 12px !important;
}
.home-skeleton-user {
  margin-bottom: 8px;
}
.article-list--skeleton {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
.article-item--skeleton {
  border-radius: 0;
  overflow: hidden;
  border: 3px solid var(--px-ink);
  background: var(--soft-read-solid);
  box-shadow: var(--nu-raised);
}

.blog-home {
  .home-content__left {
    .user-info {
      padding: 26px;
      background: var(--soft-surface-raised);
      border-radius: 0;
      border: 3px solid var(--px-ink);
      display: flex;
      align-items: center;
      box-shadow: var(--nu-raised);

      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 0;
        border: 3px solid var(--px-ink);
        overflow: hidden;
        margin-right: 18px;
        box-shadow: var(--nu-raised-sm);
        flex-shrink: 0;

        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .user-desc {
        flex: 1;
        min-width: 0;

        .name {
          font-size: 20px;
          font-weight: 700;
          line-height: 28px;
          margin-bottom: 8px;
          color: var(--soft-text);
          font-family: var(--font-display);
        }

        .describle {
          font-weight: 500;
          font-size: 16px;
          color: var(--soft-text-muted);
          line-height: 24px;
          margin-bottom: 12px;
        }

        /* 与关于页一致：标签更「像素」粗体 */
        .tag span {
          font-size: 13px;
          color: var(--soft-text-muted);
          line-height: 20px;
          padding: 6px 14px;
          background: var(--soft-surface);
          border-radius: var(--soft-radius-pill);
          border: 2px solid var(--px-ink);
          margin-right: 8px;
          display: inline-block;
          box-shadow: 2px 2px 0 var(--px-ink);
          font-weight: 700;
        }
      }
    }

    .news-article {
      margin-top: 32px;

      .title {
        font-weight: 700;
        font-size: 20px;
        color: var(--soft-text);
        line-height: 28px;
        margin-bottom: 24px;
        font-family: var(--font-display);
      }

      .article-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;

        @media screen and (max-width: 768px) {
          grid-template-columns: 1fr;
        }

        .article-item {
          border-radius: 0;
          overflow: hidden;
          border: 3px solid var(--px-ink);
          background: var(--soft-read-solid);
          box-shadow: var(--nu-raised);
          transition: box-shadow var(--transition-soft), transform var(--transition-soft);
          cursor: pointer;

          /* 仅真实鼠标悬停时抬起，避免手机点按后 :hover 粘连造成版面「错位」 */
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

          .article-pic {
            width: 100%;
            height: 192px;
            overflow: hidden;
          }

          .article-desc {
            padding: 22px;
            background: var(--soft-read);

            .name {
              font-weight: 700;
              font-size: 18px;
              color: var(--soft-text);
              line-height: 28px;
              margin-bottom: 8px;
              font-family: var(--font-display);
            }

            .introduce {
              font-weight: 500;
              font-size: 14px;
              color: var(--soft-text-muted);
              line-height: 20px;
              margin-bottom: 16px;
            }

            .time {
              font-weight: 500;
              font-size: 14px;
              color: var(--soft-text-muted);
              line-height: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;

              a {
                color: var(--soft-accent);
                cursor: pointer;
                font-weight: 600;
                &:hover {
                  color: var(--soft-accent-hover);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
