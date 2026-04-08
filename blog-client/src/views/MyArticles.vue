<template>
  <div
    class="my-articles"
    :class="{ 'my-articles--empty': !listLoading && !articles.length }"
  >
    <div class="container">
      <h1 class="page-title">我的文章</h1>

      <div v-if="listLoading" class="my-articles-skeleton">
        <el-skeleton v-for="n in 4" :key="'msk-' + n" animated :throttle="{ leading: 0 }" class="my-articles-skeleton__row">
          <template #template>
            <div class="sk-my-row">
              <el-skeleton-item variant="image" class="sk-my-cover" />
              <div class="sk-my-text">
                <el-skeleton-item variant="h3" class="sk-my-title" />
                <el-skeleton-item variant="text" class="sk-my-line" />
                <el-skeleton-item variant="text" class="sk-my-line sk-my-line--short" />
                <div class="sk-my-actions">
                  <el-skeleton-item variant="button" class="sk-my-btn" />
                  <el-skeleton-item variant="button" class="sk-my-btn" />
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <template v-else-if="articles.length > 0">
      <!-- 创建文章按钮 -->
      <el-button type="primary" class="create-btn" @click="navigateToCreate">
        <el-icon>
          <Plus />
        </el-icon>
        创建文章
      </el-button>

      <!-- 文章列表 -->
      <el-card class="article-list">
        <div v-for="(article, idx) in articles" :key="article.id" class="article-item">
          <div class="article-cover" v-if="article.cover_pic">
            <LazyImage
              :src="resolveMediaUrl(article.cover_pic)"
              alt="文章封面"
              :eager="idx < 2"
            />
          </div>
          <div class="article-content">
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-desc">{{ article.article_desc }}</p>
            <div class="article-meta">
              <span class="article-time">{{ formateDate(article.create_time) }}</span>
              <div class="article-actions">
                <el-button type="primary" size="small" @click="navigateToEdit(article.id)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="deleteArticle(article.id)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>
      </template>

      <!-- 空状态（无文章或已全部删除） -->
      <div v-else-if="!listLoading" class="empty-state-wrap">
        <el-empty description="还没有文章，写点什么吧" class="empty-state">
          <template #image>
            <div class="empty-state__icon" aria-hidden="true">
              <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="14" y="18" width="92" height="64" rx="8" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="2" />
                <path d="M28 38h64M28 52h44M28 66h52" stroke="#d1d5db" stroke-width="3" stroke-linecap="round" />
                <circle cx="88" cy="32" r="14" fill="#ede9fe" stroke="#c4b5fd" stroke-width="2" />
                <path d="M84 32h8M88 28v8" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
          </template>
          <el-button type="primary" class="empty-state__btn" @click="navigateToCreate">
            <el-icon>
              <Plus />
            </el-icon>
            创建第一篇文章
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import LazyImage from '@/components/LazyImage.vue'
import { getMyArticles, deleteArticle as deleteArticleApi } from '@/api/index.js'
import { formateDate } from '@/utils/formateDate.js'
import { resolveMediaUrl } from '@/utils/mediaUrl.js'

const router = useRouter()
const articles = ref([])
const listLoading = ref(true)

// 获取我的文章列表
const fetchMyArticles = async (silent = false) => {
  if (!silent) listLoading.value = true
  try {
    const res = await getMyArticles()
    if (res.code === 200) {
      articles.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取文章列表失败')
    console.error(error)
  } finally {
    if (!silent) listLoading.value = false
  }
}

// 导航到创建文章页面
const navigateToCreate = () => {
  router.push('/edit-article')
}

// 导航到编辑文章页面
const navigateToEdit = (id) => {
  router.push(`/edit-article/${id}`)
}

// 删除文章
const deleteArticle = (id) => {
  ElMessageBox.confirm(
    '文章将从列表中移除且无法恢复，请确认是否继续。',
    '删除这篇文章',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'article-delete-msgbox',
      confirmButtonClass: 'article-delete-msgbox__confirm',
      cancelButtonClass: 'article-delete-msgbox__cancel',
      roundButton: true,
      showClose: false,
      closeOnClickModal: false
    }
  ).then(async () => {
    try {
      const res = await deleteArticleApi(id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchMyArticles(true) // 静默刷新，避免整页骨架闪烁
      }
    } catch (error) {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 组件挂载时获取文章列表
onMounted(() => {
  fetchMyArticles()
})
</script>

<style lang="less" scoped>
.my-articles {
  min-height: 100vh;
  background: transparent;
  padding: 20px 0;

  &.my-articles--empty .container {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 40px);
  }

  &.my-articles--empty .page-title {
    text-align: center;
  }

  &.my-articles--empty .container .empty-state-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0;
    padding: 32px 0 56px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--layout-page-pad);
    box-sizing: border-box;

    .page-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 20px;
      color: var(--soft-text);
      font-family: var(--font-display);
    }

    .my-articles-skeleton {
      margin-bottom: 20px;
    }
    .my-articles-skeleton__row {
      margin-bottom: 20px;
      padding: 22px;
      background: var(--soft-surface-raised);
      border: 3px solid var(--px-ink);
      box-shadow: var(--nu-raised);
    }
    .sk-my-row {
      display: flex;
      gap: 20px;
      align-items: flex-start;
    }
    .sk-my-cover {
      width: 120px !important;
      height: 80px !important;
      flex-shrink: 0;
    }
    .sk-my-text {
      flex: 1;
      min-width: 0;
    }
    .sk-my-title {
      width: 70% !important;
      margin-bottom: 12px !important;
    }
    .sk-my-line {
      width: 100% !important;
      margin-bottom: 8px !important;
    }
    .sk-my-line--short {
      width: 55% !important;
    }
    .sk-my-actions {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }
    .sk-my-btn {
      width: 64px !important;
      height: 32px !important;
    }

    .create-btn {
      margin-bottom: 20px;
      border-radius: 0;
      border: 3px solid var(--px-ink) !important;
      box-shadow: var(--nu-raised) !important;
    }

    :deep(.article-list.el-card) {
      background: var(--soft-surface-raised);
      border: 3px solid var(--px-ink);
      border-radius: 0;
      box-shadow: var(--nu-raised);
    }

    :deep(.article-list .el-card__body) {
      padding: 0;
    }

    .article-list {
      .article-item {
        display: flex;
        padding: 22px;
        border-bottom: 1px solid rgba(197, 206, 220, 0.45);
        transition: background var(--transition-soft);

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.45);
        }

        .article-cover {
          width: 120px;
          height: 80px;
          margin-right: 20px;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0;
            border: 2px solid var(--px-ink);
            box-shadow: 2px 2px 0 var(--px-ink);
          }
        }

        .article-content {
          flex: 1;

          .article-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 10px;
            color: var(--soft-text);
            cursor: pointer;
            font-family: var(--font-display);

            &:hover {
              color: var(--soft-accent);
            }
          }

          .article-desc {
            font-size: 14px;
            color: var(--soft-text-muted);
            margin-bottom: 15px;
            line-height: 1.5;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .article-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .article-time {
              font-size: 12px;
              color: var(--soft-text-muted);
            }

            .article-actions {
              display: flex;
              gap: 10px;
            }
          }
        }
      }
    }

    .empty-state-wrap {
      margin-top: 24px;
    }

    .empty-state {
      width: 100%;
      max-width: 440px;
      margin: 0 auto;
      padding: 56px 32px 48px;
      background: var(--soft-surface-raised);
      border-radius: 0;
      border: 3px solid var(--px-ink);
      box-shadow: var(--nu-raised);
      text-align: center;

      :deep(.el-empty) {
        align-items: center;
        justify-content: center;
      }

      :deep(.el-empty__image) {
        margin: 0 auto;
      }

      :deep(.el-empty__description) {
        margin-top: 12px;
        font-size: 15px;
        color: #6b7280;
        line-height: 1.5;
        text-align: center;
      }

      :deep(.el-empty__bottom) {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    }

    .empty-state__icon {
      width: 140px;
      height: 120px;
      margin: 0 auto;
      opacity: 0.95;

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

    .empty-state__btn {
      padding: 10px 22px;
      border-radius: 0;
      font-weight: 900;
      border: 3px solid var(--px-ink) !important;
      box-shadow: var(--nu-raised) !important;
    }
  }
}

@media (max-width: 600px) {
  .my-articles {
    .sk-my-row {
      flex-direction: column;
      align-items: stretch;
    }
    .sk-my-cover {
      width: 100% !important;
      height: 160px !important;
    }

    .article-list .article-item {
      flex-direction: column;
      align-items: stretch;

      .article-cover {
        width: 100%;
        height: 160px;
        margin-right: 0;
        margin-bottom: 14px;
      }

      .article-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
  }
}
</style>

<!-- 挂载到 body 的 MessageBox，需非 scoped -->
<style lang="less">
/* 遮罩内水平垂直居中（去掉默认 ::after 行内块对齐，改用 flex） */
.el-overlay.is-message-box:has(.article-delete-msgbox) .el-overlay-message-box {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 24px !important;
  box-sizing: border-box;
}

.el-overlay.is-message-box:has(.article-delete-msgbox) .el-overlay-message-box::after {
  display: none !important;
  content: none !important;
  height: 0 !important;
  width: 0 !important;
}

.article-delete-msgbox.el-message-box {
  width: 400px;
  max-width: calc(100vw - 28px);
  padding: 0;
  border-radius: 0;
  border: 4px solid var(--px-ink);
  background: var(--soft-read-solid);
  box-shadow: 8px 8px 0 var(--px-ink);
  overflow: hidden;
}

.article-delete-msgbox .el-message-box__header {
  padding: 22px 24px 0;
  margin: 0;
  border: none;
  position: relative;
}

.article-delete-msgbox .el-message-box__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  letter-spacing: -0.02em;
  padding-right: 0;
}

.article-delete-msgbox .el-message-box__content {
  padding: 0 24px;
}

.article-delete-msgbox .el-message-box__container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0 4px;
  margin: 0;
}

.article-delete-msgbox .el-message-box__status {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  margin: 0;
  padding: 0;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  border: 3px solid var(--px-ink);
  background: #ffe566;
  box-shadow: 3px 3px 0 var(--px-ink);
  font-size: 24px !important;
}

.article-delete-msgbox .el-message-box__status.el-message-box-icon--warning {
  color: #ea580c;
}

.article-delete-msgbox .el-message-box__message {
  flex: 1;
  min-width: 0;
  padding: 6px 0 0;
}

.article-delete-msgbox .el-message-box__message p {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #64748b;
  text-align: left;
}

.article-delete-msgbox .el-message-box__btns {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 20px 24px 22px;
  margin: 0;
  background: var(--soft-surface);
  border-top: 4px dashed var(--px-ink-mid);
}

.article-delete-msgbox .el-message-box__btns .el-button {
  min-width: 96px;
  height: 40px;
  font-weight: 600;
  font-size: 14px;
}

.article-delete-msgbox__cancel.el-button {
  border: 3px solid var(--px-ink) !important;
  color: var(--px-ink) !important;
  background: #ffe566 !important;
  border-radius: 0 !important;
  box-shadow: 3px 3px 0 var(--px-ink) !important;
}

.article-delete-msgbox__cancel.el-button:hover {
  border-color: var(--px-ink) !important;
  color: var(--px-ink) !important;
  background: #fff3a0 !important;
}

.article-delete-msgbox__confirm.el-button--primary,
.article-delete-msgbox__confirm.el-button {
  border: 3px solid var(--px-ink) !important;
  background: #ff4757 !important;
  color: #fff !important;
  border-radius: 0 !important;
  box-shadow: 3px 3px 0 var(--px-ink) !important;
}

.article-delete-msgbox__confirm.el-button--primary:hover,
.article-delete-msgbox__confirm.el-button:hover {
  background: #ee3344 !important;
  box-shadow: 4px 4px 0 var(--px-ink) !important;
}
</style>