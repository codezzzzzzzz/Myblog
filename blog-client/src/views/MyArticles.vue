<template>
  <div class="my-articles">
    <div class="container">
      <h1 class="page-title">我的文章</h1>

      <!-- 创建文章按钮 -->
      <el-button v-if="articles.length" type="primary" class="create-btn" @click="navigateToCreate">
        <el-icon>
          <Plus />
        </el-icon>
        创建文章
      </el-button>

      <!-- 文章列表 -->
      <el-card class="article-list" v-if="articles.length > 0">
        <div v-for="article in articles" :key="article.id" class="article-item">
          <div class="article-cover" v-if="article.cover_pic">
            <img :src="article.cover_pic" alt="文章封面">
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

      <!-- 空状态 -->
      <el-empty v-else description="暂无文章" class="empty-state">
        <el-button type="primary" @click="navigateToCreate">
          <el-icon>
            <Plus />
          </el-icon>
          创建第一篇文章
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getMyArticles, deleteArticle as deleteArticleApi } from '@/api/index.js'
import { formateDate } from '@/utils/formateDate.js'

const router = useRouter()
const articles = ref([])

// 获取我的文章列表
const fetchMyArticles = async () => {
  try {
    const res = await getMyArticles()
    if (res.code === 200) {
      articles.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取文章列表失败')
    console.error(error)
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
    '确定要删除这篇文章吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteArticleApi(id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchMyArticles() // 重新获取文章列表
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
  background-color: #f5f7fa;
  padding: 20px 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
    }

    .create-btn {
      margin-bottom: 20px;
    }

    .article-list {
      .article-item {
        display: flex;
        padding: 20px;
        border-bottom: 1px solid #e8e8e8;
        transition: all 0.3s;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: #fafafa;
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
            border-radius: 4px;
          }
        }

        .article-content {
          flex: 1;

          .article-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #333;
            cursor: pointer;

            &:hover {
              color: #409eff;
            }
          }

          .article-desc {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
            line-height: 1.5;
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
              color: #999;
            }

            .article-actions {
              display: flex;
              gap: 10px;
            }
          }
        }
      }
    }

    .empty-state {
      margin-top: 60px;
    }
  }
}
</style>