<template>
  <div class="article_detail">
    <div class="detail-container">
      <div class="detail">
        <div class="title">{{ articleDetail.title }}</div>
        <div class="user">
          <div class="avatar">
            <img :src="authorAvatarSrc" alt="">
          </div>
          <div class="atuhor after">作者：{{ authorName }}</div>
          <div class="time after">发布于：{{ formateDate(articleDetail.create_time) }}</div>
          <div class="read">阅读：{{ articleDetail.read || 0 }}</div>
        </div>
        <article>
          <div class="banner" v-if="coverBannerSrc">
            <img :src="coverBannerSrc" alt="">
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
            <el-button color="#8E6FF7" class="btn" @click="addLike">
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
              <img :src="authorAvatarSrc" alt="">
            </div>
            <div class="author-desc">
              <p class="author-name">{{ authorName }}</p>
              <p class="author-bio">{{ authorBioDisplay }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comment">
      <div class="title">评论</div>
      <div class="comment-input">
        <textarea v-model="comment" placeholder="写下你的评论..."></textarea>
      </div>
      <el-button color="#8E6FF7" class="btn" @click="publish">发表评论</el-button>
      <div class="comment-list">
        <ul>
          <li class="list-item" v-for="item in commentList" :key="item.comment_id">
            <div class="avatar">
              <img :src="commentAvatar(item.user_avatar)" alt="">
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

const renderedContent = computed(() => renderArticleBody(articleDetail.value?.content))

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
  const res = await getArticleDetailById(route.query.id)
  articleDetail.value = res.data
  loadComment(route.query.id)
})
// 加载评论
const loadComment = async (article_id) => {
  const commentRes = await getCommentList(article_id)
  commentList.value = commentRes.data
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
  background: linear-gradient(180deg, #f3f4f6 0%, #f9fafb 32%, #f9fafb 100%);
  min-height: calc(100vh - 140px);
  padding: 28px 0 48px;
  box-sizing: border-box;

  .detail-container {
    display: flex;
    max-width: 1180px;
    margin: 0 auto;
    gap: 28px;
    padding: 0 20px;
    align-items: flex-start;

    .detail {
      flex: 1;
      min-width: 0;
      background-color: #fff;
      border-radius: 16px;
      padding: 36px 40px 40px;
      box-sizing: border-box;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);

      .title {
        font-weight: 700;
        font-size: clamp(1.5rem, 2.5vw, 1.875rem);
        color: #111827;
        line-height: 1.25;
        margin-bottom: 18px;
        letter-spacing: -0.02em;
      }

      .user {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 0;
        font-weight: 400;
        font-size: 14px;
        color: #6b7280;
        line-height: 20px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f3f4f6;

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 12px;
          flex-shrink: 0;

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

        .banner {
          width: 100%;
          height: ~"min(280px, 36vw)";
          max-height: 320px;
          margin-bottom: 28px;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          background: #f3f4f6;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        }

        .article-content {
          max-width: 100%;
          font-size: 17px;
        }
      }

      .share {
        width: 100%;
        height: 68px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .left {
          display: flex;

          .share-item {
            margin-right: 16px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            text-align: center;
            line-height: 32px;

            .iconfont {
              font-size: 20px;
              color: #fff;
            }
          }
        }

        .right {
          .btn {
            color: #fff;
          }
        }
      }
    }

    .sidebar {
      width: 288px;
      flex-shrink: 0;

      .sidebar-section {
        background-color: #fff;
        border-radius: 14px;
        padding: 22px;
        margin-bottom: 16px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 2px 12px rgba(15, 23, 42, 0.05);

        h3 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 14px;
          color: #111827;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;

          .label {
            color: #666;
          }

          .value {
            color: #333;
            font-weight: 500;
          }
        }

        .author-info {
          .author-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            overflow: hidden;
            margin-bottom: 12px;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .author-desc {
            .author-name {
              font-weight: 600;
              margin-bottom: 4px;
              color: #333;
            }

            .author-bio {
              font-size: 12px;
              color: #666;
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
    width: ~"min(100% - 40px, 1180px)";
    max-width: 1180px;
    margin: 40px auto 0;
    padding: 28px 24px 32px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
    box-sizing: border-box;

    .title {
      font-weight: 700;
      font-size: 22px;
      color: #111827;
      line-height: 1.3;
      margin-bottom: 20px;
    }

    .comment-input {
      width: 100%;
      height: 120px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      margin-bottom: 14px;
      transition: border-color 0.2s;

      &:focus-within {
        border-color: #c4b5fd;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
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
      }
    }

    .btn {
      color: #fff;
    }

    .comment-list {
      margin-top: 32px;

      .list-item {
        display: flex;
        margin-bottom: 24px;

        .avatar {
          flex: 0 0 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 12px;

          img {
            width: 100%;
          }
        }

        .comment-content {
          flex: 1;

          .comment-user {
            font-weight: 500;
            font-size: 14px;
            color: #111827;
            line-height: 20px;
            margin-bottom: 4px;
          }

          .comment-text {
            font-weight: 400;
            font-size: 14px;
            color: #4B5563;
            line-height: 20px;
            margin-bottom: 8px;
          }

          .comment-time {
            font-weight: 400;
            font-size: 12px;
            color: #6B7280;
            line-height: 16px;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .article_detail {
    .detail-container {
      flex-direction: column;

      .sidebar {
        width: 100%;
      }
    }
  }
}
</style>