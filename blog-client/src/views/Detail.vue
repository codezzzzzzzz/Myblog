<template>
  <div class="article_detail">
    <div class="detail-container">
      <template v-if="detailLoading">
        <div class="detail detail--skeleton">
          <el-skeleton animated :throttle="{ leading: 0 }">
            <template #template>
              <el-skeleton-item variant="h1" class="sk-detail-title" />
              <div class="sk-detail-meta">
                <el-skeleton-item variant="circle" class="sk-detail-avatar" />
                <el-skeleton-item variant="text" class="sk-detail-meta-text" />
              </div>
              <el-skeleton-item variant="image" class="sk-detail-banner" />
              <el-skeleton-item v-for="i in 8" :key="i" variant="p" class="sk-detail-p" />
            </template>
          </el-skeleton>
        </div>
        <div class="sidebar">
          <div class="sidebar-section">
            <el-skeleton animated :throttle="{ leading: 0 }">
              <template #template>
                <el-skeleton-item variant="h3" class="sk-side-h3" />
                <el-skeleton-item variant="text" class="sk-side-line" />
                <el-skeleton-item variant="text" class="sk-side-line" />
                <el-skeleton-item variant="text" class="sk-side-line" />
              </template>
            </el-skeleton>
          </div>
          <div class="sidebar-section">
            <el-skeleton animated :throttle="{ leading: 0 }">
              <template #template>
                <el-skeleton-item variant="h3" class="sk-side-h3" />
                <el-skeleton-item variant="image" class="sk-side-avatar" />
                <el-skeleton-item variant="text" class="sk-side-line" />
                <el-skeleton-item variant="text" class="sk-side-line sk-side-line--short" />
              </template>
            </el-skeleton>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="detail">
          <div class="title">{{ articleDetail.title }}</div>
          <div class="user">
            <div class="avatar">
              <LazyImage :src="authorAvatarSrc" alt="" :eager="true" />
            </div>
            <div class="atuhor after">作者：{{ authorName }}</div>
            <div class="time after">发布于：{{ formateDate(articleDetail.create_time) }}</div>
            <div class="read">阅读：{{ articleDetail.read || 0 }}</div>
          </div>
          <article>
            <div class="banner" v-if="coverBannerSrc">
              <LazyImage :src="coverBannerSrc" :alt="articleDetail.title || '封面'" :eager="true" />
            </div>
            <div class="article-content markdown-body" v-html="renderedContent"></div>
          </article>

          <div class="share">
            <div class="left">
              <div class="share-item" :style="{ background: randomColor(50, 150) }">
                <i class="iconfont icon-weixin"></i>
              </div>
              <div class="share-item" :style="{ background: randomColor(50, 150) }">
                <i class="iconfont icon-QQ"></i>
              </div>
            </div>
            <div class="right">
              <el-button color="#ff3b8d" class="btn" @click="addLike">
                <i class="iconfont icon-dianzan"></i>
                点赞文章 ({{ articleDetail.like_num || 0 }})
              </el-button>
            </div>
          </div>
        </div>

        <!-- 侧边栏 -->
        <div class="sidebar">
          <div class="sidebar-section">
            <h3>文章信息</h3>
            <div class="info-item">
              <span class="label">发布时间：</span>
              <span class="value">{{ formateDate(articleDetail.create_time) }}</span>
            </div>
            <div class="info-item">
              <span class="label">点赞数：</span>
              <span class="value">{{ articleDetail.like_num || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="label">评论数：</span>
              <span class="value">{{ commentList.length }}</span>
            </div>
          </div>
          <div class="sidebar-section">
            <h3>关于作者</h3>
            <div class="author-info">
              <div class="author-avatar">
                <LazyImage :src="authorAvatarSrc" alt="" />
              </div>
              <div class="author-desc">
                <p class="author-name">{{ authorName }}</p>
                <p class="author-bio">{{ authorBioDisplay }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="comment">
      <div class="title">评论</div>
      <div class="comment-input">
        <textarea v-model="comment" placeholder="写下你的评论..."></textarea>
      </div>
      <el-button color="#ff3b8d" class="btn" @click="publish">发表评论</el-button>
      <div class="comment-list">
        <div v-if="commentLoading" class="comment-list--skeleton">
          <el-skeleton v-for="c in 3" :key="'csk-' + c" animated :throttle="{ leading: 0 }" class="comment-sk-item">
            <template #template>
              <div class="sk-comment-row">
                <el-skeleton-item variant="circle" class="sk-comment-avatar" />
                <div class="sk-comment-text">
                  <el-skeleton-item variant="text" class="sk-comment-name" />
                  <el-skeleton-item variant="text" class="sk-comment-body" />
                  <el-skeleton-item variant="text" class="sk-comment-time" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
        <ul v-else>
          <li class="list-item" v-for="item in commentList" :key="item.comment_id">
            <div class="avatar">
              <LazyImage :src="commentAvatar(item.user_avatar)" alt="" />
            </div>
            <div class="comment-content">
              <div class="comment-user">{{ item.user_nickname }}</div>
              <div class="comment-text">
                {{ item.comment_content }}
              </div>
              <div class="comment-time">{{ formateDate(item.comment_created_at, true) }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import LazyImage from '@/components/LazyImage.vue'
import { renderArticleBody } from '@/utils/markdown.js'
import { useRoute } from 'vue-router'
import { getArticleDetailById, addLikeApi, addCommentApi, getCommentList } from '@/api/index.js'
import { formateDate } from '@/utils/formateDate.js'
import { randomColor } from '@/utils/randomColor.js'
import { isLogin } from '@/utils/isLogin.js'
import { resolveMediaUrl, DEFAULT_AVATAR_URL } from '@/utils/mediaUrl.js'

const route = useRoute()
// console.log(route.query.id);
const articleDetail = ref({})
const comment = ref('')
const commentList = ref([])
const detailLoading = ref(true)
const commentLoading = ref(true)

const renderedContent = computed(() =>
  renderArticleBody(articleDetail.value?.content, { foldCodeBlocks: true })
)

const authorName = computed(() => articleDetail.value?.author_nickname || '匿名用户')

const authorAvatarSrc = computed(() => {
  const u = resolveMediaUrl(articleDetail.value?.author_avatar)
  return u || DEFAULT_AVATAR_URL
})

const authorBioDisplay = computed(() => {
  const b = articleDetail.value?.author_bio
  if (b != null && String(b).trim() !== '') return String(b).trim()
  return '暂无简介'
})

const coverBannerSrc = computed(() => {
  const pic = articleDetail.value?.cover_pic
  return pic ? resolveMediaUrl(pic) : ''
})

const commentAvatar = (userAvatar) => {
  const u = resolveMediaUrl(userAvatar)
  return u || DEFAULT_AVATAR_URL
}

onMounted(async () => {
  detailLoading.value = true
  commentLoading.value = true
  try {
    const res = await getArticleDetailById(route.query.id)
    articleDetail.value = res.data
  } finally {
    detailLoading.value = false
  }
  await loadComment(route.query.id)
})
// 加载评论
const loadComment = async (article_id) => {
  commentLoading.value = true
  try {
    const commentRes = await getCommentList(article_id)
    commentList.value = commentRes.data
  } finally {
    commentLoading.value = false
  }
}
const addLike = async () => {
  // 点赞, 向后端发送一个请求, 把文章的id传过去，用户的id也传过去
  // 登录问题
  if (isLogin()) { // 登录了
    const res = await addLikeApi({ article_id: route.query.id })
    ElMessage({
      message: res.msg,
      type: res.data === 'success' ? 'success' : 'warning',
    })
  } else {
    ElMessage({
      message: '点赞功能需要先登录哦',
      type: 'warning',
    })
  }
}

// 发表评论
const publish = async () => {
  if (comment.value === '') {
    ElMessage({
      message: '评论内容不能为空',
      type: 'error',
    })
    return
  }

  if (isLogin()) {
    const res = await addCommentApi({
      article_id: route.query.id,
      comment: comment.value
    })
    if (res.data === 'success') {
      ElMessage({
        message: '评论成功',
        type: 'success',
      })
      comment.value = ''
      loadComment(route.query.id)
    } else {
      ElMessage({
        message: res.msg,
        type: 'error',
      })

    }

  } else {
    ElMessage({
      message: '评论功能需要先登录哦',
      type: 'warning',
    })
  }
}
</script>

<style lang="less" scoped>
.article_detail {
  width: 100%;
  max-width: 100%;
  background: transparent;
  min-height: calc(100vh - var(--header-h) - var(--footer-h));
  padding: 24px 0 40px;
  box-sizing: border-box;

  .detail--skeleton {
    .sk-detail-title {
      width: 90% !important;
      height: 36px !important;
      margin-bottom: 18px !important;
    }

    .sk-detail-meta {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
    }

    .sk-detail-avatar {
      width: 40px !important;
      height: 40px !important;
      flex-shrink: 0;
    }

    .sk-detail-meta-text {
      width: min(200px, 60%) !important;
      height: 20px !important;
    }

    .sk-detail-banner {
      width: 100% !important;
      height: min(220px, 36vw) !important;
      margin-bottom: 24px !important;
    }

    .sk-detail-p {
      margin-bottom: 8px !important;
    }
  }

  .sidebar-section .sk-side-h3 {
    width: 120px !important;
    margin-bottom: 14px !important;
  }

  .sk-side-line {
    width: 100% !important;
    margin-bottom: 12px !important;
  }

  .sk-side-line--short {
    width: 70% !important;
  }

  .sk-side-avatar {
    width: 60px !important;
    height: 60px !important;
    margin-bottom: 12px !important;
  }

  .comment-list--skeleton {
    margin-top: 0;
  }

  .comment-sk-item {
    margin-bottom: 24px;
  }

  .sk-comment-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .sk-comment-avatar {
    width: 40px !important;
    height: 40px !important;
    flex-shrink: 0;
  }

  .sk-comment-text {
    flex: 1;
    min-width: 0;
  }

  .sk-comment-name {
    width: 100px !important;
    margin-bottom: 8px !important;
  }

  .sk-comment-body {
    width: 100% !important;
    margin-bottom: 8px !important;
  }

  .sk-comment-time {
    width: 88px !important;
  }

  .detail-container {
    display: flex;
    flex-direction: row;
    max-width: 1180px;
    margin: 0 auto;
    gap: 28px;
    padding: 0 var(--layout-page-pad);
    align-items: flex-start;

    .detail {
      flex: 1;
      min-width: 0;
      background: var(--soft-read-solid);
      border-radius: 0;
      padding: clamp(20px, 4vw, 36px) clamp(18px, 4vw, 40px) 32px;
      box-sizing: border-box;
      border: 3px solid var(--px-ink);
      box-shadow: var(--shadow-readable);

      .title {
        font-weight: 700;
        font-size: clamp(1.5rem, 2.5vw, 1.875rem);
        color: var(--soft-text);
        line-height: 1.25;
        margin-bottom: 18px;
        letter-spacing: -0.02em;
        font-family: var(--font-display);
      }

      .user {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 0;
        font-weight: 500;
        font-size: 14px;
        color: var(--soft-text-muted);
        line-height: 20px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(197, 206, 220, 0.5);

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 0;
          border: 3px solid var(--px-ink);
          overflow: hidden;
          margin-right: 12px;
          flex-shrink: 0;
          box-shadow: 2px 2px 0 var(--px-ink);

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        }

        .after {
          margin-right: 8px;
          padding-right: 8px;
          position: relative;

          &::after {
            content: '';
            width: 1px;
            height: 12px;
            background-color: #6B7280;
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
          }
        }
      }

      article {
        padding: 28px 0 48px;
        min-width: 0;
        /* 勿设 overflow-x: hidden，部分移动浏览器会导致内层代码横向滚动失效 */

        .banner {
          width: 100%;
          height: ~"min(280px, 36vw)";
          max-height: 320px;
          margin-bottom: 28px;
          overflow: hidden;
          border-radius: 0;
          border: 3px solid var(--px-ink);
          background: var(--soft-surface);
          box-shadow: 2px 2px 0 var(--px-ink);

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        }

        .article-content {
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          font-size: 17px;
          box-sizing: border-box;
        }
      }

      .share {
        width: 100%;
        min-height: 68px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 14px;

        .left {
          display: flex;

          .share-item {
            margin-right: 16px;
            width: 32px;
            height: 32px;
            border-radius: 0;
            border: 2px solid var(--px-ink);
            box-shadow: 2px 2px 0 var(--px-ink);
            cursor: pointer;
            text-align: center;
            line-height: 28px;

            .iconfont {
              font-size: 20px;
              color: #fff;
            }
          }
        }

        .right {
          flex-shrink: 0;

          .btn {
            color: #fff;
            border-radius: 0;
            border: 3px solid var(--px-ink) !important;
            box-shadow: var(--nu-raised-sm) !important;
          }
        }
      }
    }

    .sidebar {
      width: min(288px, 100%);
      flex-shrink: 0;

      .sidebar-section {
        background: var(--soft-surface-raised);
        border-radius: 0;
        padding: 22px;
        margin-bottom: 16px;
        border: 3px solid var(--px-ink);
        box-shadow: var(--nu-raised);

        h3 {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 14px;
          color: var(--soft-text);
          font-family: var(--font-display);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;

          .label {
            color: var(--soft-text-muted);
          }

          .value {
            color: var(--soft-text);
            font-weight: 600;
          }
        }

        .author-info {
          .author-avatar {
            width: 60px;
            height: 60px;
            border-radius: 0;
            border: 3px solid var(--px-ink);
            overflow: hidden;
            margin-bottom: 12px;
            box-shadow: 3px 3px 0 var(--px-ink);

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .author-desc {
            .author-name {
              font-weight: 700;
              margin-bottom: 4px;
              color: var(--soft-text);
            }

            .author-bio {
              font-size: 12px;
              color: var(--soft-text-muted);
              line-height: 1.4;
              white-space: pre-wrap;
              word-break: break-word;
            }
          }
        }
      }
    }
  }

  .comment {
    width: min(1180px, calc(100% - 2 * var(--layout-page-pad)));
    max-width: 1180px;
    margin: 32px auto 0;
    padding: clamp(20px, 4vw, 28px) clamp(16px, 3vw, 24px) 28px;
    background: var(--soft-read-solid);
    border-radius: 0;
    border: 3px solid var(--px-ink);
    box-shadow: var(--shadow-readable);
    box-sizing: border-box;

    .title {
      font-weight: 700;
      font-size: 22px;
      color: var(--soft-text);
      line-height: 1.3;
      margin-bottom: 20px;
      font-family: var(--font-display);
    }

    .comment-input {
      width: 100%;
      height: 120px;
      border-radius: 0;
      border: 3px solid var(--px-ink);
      overflow: hidden;
      margin-bottom: 14px;
      background: var(--soft-read);
      box-shadow: var(--nu-inset-sm);
      transition: box-shadow var(--transition-soft);

      &:focus-within {
        box-shadow: var(--nu-raised-sm);
      }

      textarea {
        border: none;
        width: 100%;
        height: 100%;
        padding: 14px 16px;
        box-sizing: border-box;
        outline: none;
        font-size: 14px;
        line-height: 1.5;
        resize: vertical;
        min-height: 100px;
        background: transparent;
        color: var(--soft-text);
      }
    }

    .btn {
      color: #fff;
      border-radius: 0;
      border: 3px solid var(--px-ink) !important;
      box-shadow: var(--nu-raised-sm) !important;
    }

    .comment-list {
      margin-top: 32px;

      .list-item {
        display: flex;
        margin-bottom: 24px;

        .avatar {
          flex: 0 0 40px;
          height: 40px;
          border-radius: 0;
          border: 2px solid var(--px-ink);
          overflow: hidden;
          margin-right: 12px;
          box-shadow: 2px 2px 0 var(--px-ink);

          img {
            width: 100%;
          }
        }

        .comment-content {
          flex: 1;

          .comment-user {
            font-weight: 600;
            font-size: 14px;
            color: var(--soft-text);
            line-height: 20px;
            margin-bottom: 4px;
          }

          .comment-text {
            font-weight: 500;
            font-size: 14px;
            color: var(--soft-text-muted);
            line-height: 20px;
            margin-bottom: 8px;
          }

          .comment-time {
            font-weight: 500;
            font-size: 12px;
            color: var(--soft-text-muted);
            line-height: 16px;
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .article_detail {
    .detail-container {
      flex-direction: column;
      /* 与 .comment 同宽：不再额外缩进，外边距仅由 .article_detail（小屏）与卡片内边距承担 */
      max-width: none;
      width: 100%;
      margin-left: 0;
      margin-right: 0;
      padding-left: 0;
      padding-right: 0;
      box-sizing: border-box;

      .detail {
        width: 100%;
        max-width: none;
        box-sizing: border-box;
        padding-left: max(env(safe-area-inset-left, 0px), clamp(14px, 4vw, 22px));
        padding-right: max(env(safe-area-inset-right, 0px), clamp(14px, 4vw, 22px));
      }

      .sidebar {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;

        .sidebar-section {
          margin-bottom: 0;
        }
      }
    }

    .comment {
      width: 100%;
      max-width: none;
      margin-left: 0;
      margin-right: 0;
      box-sizing: border-box;
      padding-left: max(env(safe-area-inset-left, 0px), clamp(14px, 4vw, 22px));
      padding-right: max(env(safe-area-inset-right, 0px), clamp(14px, 4vw, 22px));
    }
  }
}

@media (max-width: 768px) {
  .article_detail {
    padding: 16px 0 32px;
    padding-left: max(env(safe-area-inset-left, 0px), clamp(12px, 3.5vw, 20px));
    padding-right: max(env(safe-area-inset-right, 0px), clamp(12px, 3.5vw, 20px));

    .detail-container {
      gap: 20px;
    }

    .detail {
      .user .after::after {
        display: none;
      }

      article {
        padding: 20px 0 36px;

        .banner {
          height: min(200px, 52vw);
          max-height: 240px;
        }

        .article-content {
          font-size: 16px;
        }
      }

      .share {
        flex-direction: column;
        align-items: stretch;

        .left {
          justify-content: center;
        }

        .right .btn {
          width: 100%;
        }
      }
    }

    .comment {
      margin-top: 24px;
    }
  }
}
</style>