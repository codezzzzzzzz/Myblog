<template>
  <div class="edit-article">
    <div class="container">
      <h1 class="page-title">{{ isEdit ? '编辑文章' : '创建文章' }}</h1>

      <el-card class="edit-form">
        <!-- 文章标题 -->
        <el-form-item label="文章标题">
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="200" show-word-limit />
        </el-form-item>

        <!-- 封面图片 -->
        <el-form-item label="封面图片">
          <el-upload class="cover-upload" action="" :http-request="uploadCover" :on-success="handleCoverSuccess"
            :on-error="handleCoverError" :file-list="coverFileList" :auto-upload="true" :limit="1">
            <template #trigger>
              <el-button type="primary">
                <el-icon>
                  <Plus />
                </el-icon>
                选择图片
              </el-button>
            </template>
            <template #default>
              <div v-if="form.cover_pic" class="cover-preview">
                <img :src="form.cover_pic" alt="封面预览">
                <el-button type="danger" size="small" @click="removeCover">
                  删除
                </el-button>
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 创建时间 -->
        <el-form-item label="创建时间">
          <el-date-picker v-model="form.create_time" type="date" placeholder="选择创建时间" style="width: 100%" />
        </el-form-item>

        <!-- 文章摘要 -->
        <el-form-item label="文章摘要">
          <el-input v-model="form.article_desc" type="textarea" placeholder="请输入文章摘要" maxlength="255" show-word-limit
            :rows="3" />
        </el-form-item>

        <!-- 文章标签 -->
        <el-form-item label="文章标签">
          <el-select v-model="form.tags" multiple placeholder="请选择标签" style="width: 100%">
            <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
          </el-select>
        </el-form-item>

        <!-- 文章内容 -->
        <el-form-item label="文章内容">
          <div class="editor-container">
            <div class="editor-toolbar">
              <el-button type="primary" @click="saveArticle" :loading="saving">
                保存
              </el-button>
              <el-button @click="previewArticle">
                预览
              </el-button>
              <el-button @click="router.push('/my-articles')">
                取消
              </el-button>
            </div>
            <div class="editor-content">
              <div class="editor-main">
                <div class="wangeditor-wrap">
                  <Toolbar class="wangeditor-toolbar" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
                  <Editor v-model="form.content" :defaultConfig="editorConfig" :mode="mode" class="wangeditor-body"
                    @onCreated="handleEditorCreated" @onChange="handleEditorChange" />
                </div>
              </div>
              <div class="editor-sidebar">
                <div class="sidebar-section">
                  <h3>字数统计</h3>
                  <p>{{ wordCount }} 字</p>
                </div>
                <div class="sidebar-section">
                  <h3>保存状态</h3>
                  <p :class="{ 'saved': saveStatus === 'saved', 'unsaved': saveStatus === 'unsaved' }">
                    {{ saveStatus === 'saved' ? '已保存' : '未保存' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import {
  getArticleDetailById,
  createArticle,
  updateArticle,
  uploadCover as uploadCoverApi,
  uploadImage as uploadImageApi,
  getAllArticleCategory
} from '@/api/index.js'

const router = useRouter()
const route = useRoute()
const articleId = route.params.id
const isEdit = !!articleId

// 表单数据
const form = ref({
  title: '',
  content: '',
  create_time: new Date(),
  cover_pic: '',
  article_desc: '',
  tags: []
})

// 状态
const saving = ref(false)
const saveStatus = ref('saved')
const coverFileList = ref([])
const tags = ref([])

const editorRef = shallowRef()
const mode = 'default'
const toolbarConfig = {}

const handleEditorCreated = (editor) => {
  editorRef.value = editor
}

onBeforeUnmount(() => {
  const ed = editorRef.value
  if (ed == null) return
  ed.destroy()
  editorRef.value = undefined
})

// 计算属性
const wordCount = computed(() => {
  return form.value.content.length
})

// 编辑器配置
const editorConfig = {
  placeholder: '请输入文章内容...',
  MENU_CONF: {
    uploadImage: {
      customBrowse: false,
      customUpload: async (file, insertFn) => {
        try {
          console.log('[EditArticle][正文图片] 提交前 file 对象:', file)
          console.log('[EditArticle][正文图片] 提交前 file 摘要:', {
            name: file?.name,
            size: file?.size,
            type: file?.type,
            ctor: file?.constructor?.name,
            lastModified: file?.lastModified
          })
          const formData = new FormData()
          formData.append('image', file)
          for (const [key, val] of formData.entries()) {
            console.log('[EditArticle][正文图片] FormData 条目:', key, val instanceof File ? { name: val.name, size: val.size, type: val.type } : val)
          }
          console.log('[EditArticle][正文图片] 即将请求 uploadImageApi')
          const res = await uploadImageApi(formData)
          if (res.code === 200) {
            insertFn(res.data.url)
            ElMessage.success('图片上传成功')
          } else {
            ElMessage.error('图片上传失败')
          }
        } catch (error) {
          console.error('图片上传错误:', error)
          ElMessage.error('图片上传错误')
        }
      }
    }
  }
}

// 获取文章详情
const fetchArticleDetail = async () => {
  try {
    const res = await getArticleDetailById(articleId)
    if (res.code === 200) {
      const article = res.data
      form.value = {
        ...article,
        create_time: new Date(article.create_time),
        tags: []
      }
    }
  } catch (error) {
    ElMessage.error('获取文章详情失败')
    console.error(error)
  }
}

// 获取标签列表
const fetchTags = async () => {
  try {
    const res = await getAllArticleCategory()
    if (res.code === 200) {
      tags.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取标签列表失败')
    console.error(error)
  }
}

// 上传封面图片
const uploadCover = async (options) => {
  const { file } = options
  console.log('[EditArticle][封面] 提交前 raw file:', file)
  console.log('[EditArticle][封面] 提交前 file 摘要:', {
    name: file?.name,
    size: file?.size,
    type: file?.type,
    ctor: file?.constructor?.name
  })
  const formData = new FormData()
  formData.append('cover', file)
  for (const [key, val] of formData.entries()) {
    console.log('[EditArticle][封面] FormData 条目:', key, val instanceof File ? { name: val.name, size: val.size, type: val.type } : val)
  }
  console.log('[EditArticle][封面] 即将请求 uploadCoverApi')

  try {
    const res = await uploadCoverApi(formData)
    if (res.code === 200) {
      options.onSuccess(res.data)
    } else {
      options.onError(new Error('上传失败'))
    }
  } catch (error) {
    options.onError(error)
  }
}

// 处理封面上传成功
const handleCoverSuccess = (response) => {
  form.value.cover_pic = response.url
  coverFileList.value = [{ url: response.url }]
  ElMessage.success('封面上传成功')
}

// 处理封面上传失败
const handleCoverError = () => {
  ElMessage.error('封面上传失败')
}

// 移除封面
const removeCover = () => {
  form.value.cover_pic = ''
  coverFileList.value = []
}

// 处理编辑器内容变化
const handleEditorChange = () => {
  saveStatus.value = 'unsaved'
}

// 保存文章
const saveArticle = async () => {
  if (!form.value.title) {
    ElMessage.error('请输入文章标题')
    return
  }

  if (!form.value.content) {
    ElMessage.error('请输入文章内容')
    return
  }

  saving.value = true

  try {
    const articleData = {
      ...form.value,
      create_time: form.value.create_time.getTime()
    }

    let res
    if (isEdit) {
      res = await updateArticle({ ...articleData, id: articleId })
    } else {
      res = await createArticle(articleData)
    }

    if (res.code === 200) {
      ElMessage.success(isEdit ? '更新成功' : '创建成功')
      saveStatus.value = 'saved'
      router.push('/my-articles')
    }
  } catch (error) {
    ElMessage.error(isEdit ? '更新失败' : '创建失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 预览文章
const previewArticle = () => {
  if (isEdit) {
    router.push(`/detail?id=${articleId}`)
  } else {
    ElMessage.info('请先保存文章')
  }
}

// 组件挂载时
onMounted(async () => {
  await fetchTags()
  if (isEdit) {
    await fetchArticleDetail()
  }
})
</script>

<style lang="less" scoped>
.edit-article {
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

    .edit-form {
      .cover-upload {
        .cover-preview {
          position: relative;
          display: inline-block;
          margin-top: 10px;

          img {
            width: 200px;
            height: 120px;
            object-fit: cover;
            border-radius: 4px;
          }

          .el-button {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            border-radius: 0 0 4px 4px;
            opacity: 0.8;
          }
        }
      }

      .editor-container {
        .editor-toolbar {
          margin-bottom: 10px;
          display: flex;
          gap: 10px;
        }

        .editor-content {
          display: flex;
          gap: 20px;

          .editor-main {
            flex: 1;
            min-height: 600px;
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            overflow: hidden;

            .wangeditor-wrap {
              display: flex;
              flex-direction: column;
              height: 100%;
              min-height: 600px;
            }

            .wangeditor-toolbar {
              border-bottom: 1px solid #e8e8e8;
            }

            .wangeditor-body {
              flex: 1;
              overflow: hidden;
            }

            :deep(.w-e-text-container) {
              height: 520px !important;
            }
          }

          .editor-sidebar {
            width: 200px;
            flex-shrink: 0;
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            padding: 15px;
            background-color: #fafafa;

            .sidebar-section {
              margin-bottom: 20px;

              h3 {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #333;
              }

              p {
                font-size: 12px;
                color: #666;

                &.saved {
                  color: #67c23a;
                }

                &.unsaved {
                  color: #f56c6c;
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
