<template>
  <div class="edit-article">
    <div class="container">
      <h1 class="page-title">{{ isEdit ? '编辑文章' : '创建文章' }}</h1>

      <el-card class="edit-form" shadow="hover">
        <el-form class="article-edit-form" label-position="top" @submit.prevent>
        <!-- 文章标题 -->
        <el-form-item label="文章标题" class="form-row">
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="200" show-word-limit clearable
            class="form-control" />
        </el-form-item>

        <!-- 封面图片 -->
        <el-form-item label="封面图片" class="form-row">
          <el-upload class="cover-upload" action="" :before-upload="beforeCoverUpload" :show-file-list="false" :limit="1">
            <template #trigger>
              <el-button v-if="!form.cover_pic" type="primary">
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
        <el-form-item label="创建时间" class="form-row form-row--date">
          <div class="field-block field-block--date">
            <el-date-picker v-model="form.create_time" type="date" placeholder="选择创建时间" class="form-date"
              :editable="false" />
          </div>
        </el-form-item>

        <!-- 文章摘要 -->
        <el-form-item label="文章摘要" class="form-row form-row--desc">
          <el-input v-model="form.article_desc" type="textarea" placeholder="列表与卡片中展示的简短描述" maxlength="255"
            show-word-limit :rows="3" class="form-control" />
        </el-form-item>

        <!-- 文章标签 -->
        <el-form-item label="文章标签" class="form-row">
          <el-select v-model="form.tags" multiple placeholder="请选择标签" class="form-control" collapse-tags
            collapse-tags-tooltip>
            <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
          </el-select>
        </el-form-item>

        <!-- 文章内容（Markdown 原文入库） -->
        <el-form-item class="form-row form-row--markdown">
          <template #label>
            <div class="md-form-label">
              <span class="md-form-label__title">正文 Markdown</span>
              <span class="field-hint">以 Markdown 保存到数据库，详情页自动渲染为 HTML</span>
            </div>
          </template>
          <div class="md-editor-page">
            <div class="md-toolbar">
              <el-button type="primary" @click="saveArticle" :loading="saving">
                保存
              </el-button>
              <el-button @click="openMarkdownPreview">预览</el-button>
              <el-button @click="router.push('/my-articles')">取消</el-button>
              <el-upload class="md-upload" action="" :http-request="uploadMarkdownImage" :show-file-list="false"
                accept="image/*">
                <el-button>
                  <el-icon>
                    <Picture />
                  </el-icon>
                  插入图片
                </el-button>
              </el-upload>
            </div>
            <div class="md-panels">
              <div class="md-panel md-panel--edit">
                <div class="md-panel__head">编辑</div>
                <textarea ref="markdownTextareaRef" v-model="form.content" class="md-textarea" spellcheck="false"
                  placeholder="# 标题&#10;&#10;正文支持 **粗体**、`代码`、[链接](url)、图片等 Markdown 语法。"
                  @input="handleContentInput" />
              </div>
              <div class="md-panel md-panel--preview">
                <div class="md-panel__head">实时预览</div>
                <div class="md-preview-scroll">
                  <div class="markdown-body markdown-body--live" v-html="renderedMdHtml"></div>
                </div>
              </div>
            </div>
            <div class="md-meta-row">
              <span class="md-meta">字数 {{ wordCount }}</span>
              <span class="md-meta" :class="{ 'saved': saveStatus === 'saved', 'unsaved': saveStatus === 'unsaved' }">
                {{ saveStatus === 'saved' ? '已保存' : '未保存' }}
              </span>
            </div>
          </div>
        </el-form-item>
        </el-form>
      </el-card>
    </div>

    <el-dialog v-model="cropDialogVisible" :title="cropDialogTitle" width="580px" append-to-body destroy-on-close
      @closed="onCropDialogClosed">
      <div class="image-cropper-wrap">
        <img v-show="cropImageUrl" ref="cropImgRef" :src="cropImageUrl" alt="" class="image-cropper-source" />
      </div>
      <template #footer>
        <el-button @click="onCropCancel">取消</el-button>
        <el-button type="primary" @click="onCropConfirm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewDialogVisible" title="Markdown 预览" width="880px" append-to-body destroy-on-close
      class="md-preview-dialog">
      <div class="markdown-body markdown-body--preview" v-html="renderedMdHtml"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue'
import Cropper from 'cropperjs'
import { renderArticleBody } from '@/utils/markdown.js'
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

/** 与封面预览区域比例一致：200×120 */
const COVER_CROP_RATIO = 200 / 120

/**
 * 与 cropperjs@2.1.0 包内 DEFAULT_TEMPLATE 一致。
 * Vite 对 cropperjs 做依赖预构建时不会保留该命名导出，故内联在此。
 */
const CROPPER_DEFAULT_TEMPLATE =
  '<cropper-canvas background>' +
  '<cropper-image rotatable scalable skewable translatable></cropper-image>' +
  '<cropper-shade hidden></cropper-shade>' +
  '<cropper-handle action="select" plain></cropper-handle>' +
  '<cropper-selection initial-coverage="0.5" movable resizable>' +
  '<cropper-grid role="grid" bordered covered></cropper-grid>' +
  '<cropper-crosshair centered></cropper-crosshair>' +
  '<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>' +
  '<cropper-handle action="n-resize"></cropper-handle>' +
  '<cropper-handle action="e-resize"></cropper-handle>' +
  '<cropper-handle action="s-resize"></cropper-handle>' +
  '<cropper-handle action="w-resize"></cropper-handle>' +
  '<cropper-handle action="ne-resize"></cropper-handle>' +
  '<cropper-handle action="nw-resize"></cropper-handle>' +
  '<cropper-handle action="se-resize"></cropper-handle>' +
  '<cropper-handle action="sw-resize"></cropper-handle>' +
  '</cropper-selection>' +
  '</cropper-canvas>'

/** v2：在默认模板上为封面锁定选区宽高比 */
const COVER_CROP_TEMPLATE = CROPPER_DEFAULT_TEMPLATE.replace(
  '<cropper-selection initial-coverage="0.5" movable resizable>',
  `<cropper-selection initial-coverage="0.5" movable resizable aspect-ratio="${COVER_CROP_RATIO}">`
)

const cropDialogVisible = ref(false)
const cropImageUrl = ref('')
const cropImgRef = ref(null)
const cropMode = ref('cover')
const cropFixedAspect = ref(true)
const cropOriginalName = ref('image')
let cropperInstance = null
let editorCropHandlers = null

const cropDialogTitle = computed(() =>
  cropMode.value === 'cover' ? '裁剪封面（固定比例）' : '裁剪正文图片'
)

const markdownTextareaRef = ref(null)
const previewDialogVisible = ref(false)

onBeforeUnmount(() => {
  destroyCropper()
  if (cropImageUrl.value) {
    URL.revokeObjectURL(cropImageUrl.value)
    cropImageUrl.value = ''
  }
})

const wordCount = computed(() => form.value.content.length)

const renderedMdHtml = computed(() => renderArticleBody(form.value.content))

function handleContentInput() {
  saveStatus.value = 'unsaved'
}

function insertMarkdownSnippet(snippet) {
  const ta = markdownTextareaRef.value
  const v = form.value.content
  if (!ta) {
    form.value.content = v + snippet
    handleContentInput()
    return
  }
  const start = ta.selectionStart ?? v.length
  const end = ta.selectionEnd ?? v.length
  form.value.content = v.slice(0, start) + snippet + v.slice(end)
  handleContentInput()
  nextTick(() => {
    ta.focus()
    const pos = start + snippet.length
    ta.setSelectionRange(pos, pos)
  })
}

const uploadMarkdownImage = async (options) => {
  const { file, onError } = options
  try {
    const cropped = await openEditorCrop(file)
    const formData = new FormData()
    formData.append('image', cropped)
    const res = await uploadImageApi(formData)
    if (res.code === 200) {
      insertMarkdownSnippet(`\n![图片](${res.data.url})\n`)
      ElMessage.success('图片已插入')
    } else {
      ElMessage.error('图片上传失败')
      onError?.(new Error('upload'))
    }
  } catch (e) {
    if (e && e.message !== 'cancelled') {
      ElMessage.error('图片上传失败')
    }
    onError?.(e)
  }
}

function openMarkdownPreview() {
  previewDialogVisible.value = true
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

function destroyCropper() {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
}

async function initCropper() {
  destroyCropper()
  await nextTick()
  const el = cropImgRef.value
  if (!el || !cropImageUrl.value) return
  if (!el.complete) {
    try {
      await new Promise((resolve, reject) => {
        el.onload = () => resolve()
        el.onerror = () => reject(new Error('图片加载失败'))
      })
    } catch {
      ElMessage.error('图片加载失败')
      return
    }
  }
  if (!cropImageUrl.value) return
  const template = cropFixedAspect.value ? COVER_CROP_TEMPLATE : CROPPER_DEFAULT_TEMPLATE
  cropperInstance = new Cropper(el, { template })
}

function openCoverCrop(file) {
  cropMode.value = 'cover'
  cropFixedAspect.value = true
  cropOriginalName.value = file.name || 'cover'
  if (cropImageUrl.value) URL.revokeObjectURL(cropImageUrl.value)
  cropImageUrl.value = URL.createObjectURL(file)
  cropDialogVisible.value = true
  nextTick(() => initCropper())
}

function openEditorCrop(file) {
  return new Promise((resolve, reject) => {
    editorCropHandlers = { resolve, reject }
    cropMode.value = 'editor'
    cropFixedAspect.value = false
    cropOriginalName.value = file.name || 'image'
    if (cropImageUrl.value) URL.revokeObjectURL(cropImageUrl.value)
    cropImageUrl.value = URL.createObjectURL(file)
    cropDialogVisible.value = true
    nextTick(() => initCropper())
  })
}

const beforeCoverUpload = (file) => {
  const isImage = file.type?.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请选择图片文件')
    return false
  }
  openCoverCrop(file)
  return false
}

async function performCoverUpload(file) {
  const formData = new FormData()
  formData.append('cover', file)
  try {
    const res = await uploadCoverApi(formData)
    if (res.code === 200) {
      handleCoverSuccess(res.data)
    } else {
      ElMessage.error('封面上传失败')
    }
  } catch {
    ElMessage.error('封面上传失败')
  }
}

const onCropConfirm = async () => {
  if (!cropperInstance) return
  const selection = cropperInstance.getCropperSelection()
  if (!selection) {
    ElMessage.error('裁剪区域未就绪')
    return
  }
  try {
    const w = selection.width
    const h = selection.height
    const maxSide = Math.max(w, h)
    const scale = maxSide > 4096 ? 4096 / maxSide : 1
    const opts =
      scale < 1
        ? { width: Math.round(w * scale), height: Math.round(h * scale) }
        : undefined
    const canvas = await selection.$toCanvas(opts)
    destroyCropper()
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', 0.92)
    })
    const base = (cropOriginalName.value || 'image').replace(/\.[^.]+$/, '')
    const outFile = new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
    if (cropMode.value === 'editor' && editorCropHandlers) {
      editorCropHandlers.resolve(outFile)
      editorCropHandlers = null
    } else if (cropMode.value === 'cover') {
      void performCoverUpload(outFile)
    }
    cropDialogVisible.value = false
  } catch {
    ElMessage.error('裁剪失败')
    destroyCropper()
  }
}

const onCropCancel = () => {
  if (editorCropHandlers) {
    editorCropHandlers.reject(new Error('cancelled'))
    editorCropHandlers = null
  }
  cropDialogVisible.value = false
}

const onCropDialogClosed = () => {
  destroyCropper()
  if (cropImageUrl.value) {
    URL.revokeObjectURL(cropImageUrl.value)
    cropImageUrl.value = ''
  }
  if (editorCropHandlers) {
    editorCropHandlers.reject(new Error('cancelled'))
    editorCropHandlers = null
  }
}

// 处理封面上传成功
const handleCoverSuccess = (response) => {
  form.value.cover_pic = response.url
  coverFileList.value = [{ url: response.url }]
  ElMessage.success('封面上传成功')
}

// 移除封面
const removeCover = () => {
  form.value.cover_pic = ''
  coverFileList.value = []
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
      border-radius: 16px;
      border: 1px solid #e8eaed;
      overflow: hidden;

      :deep(.el-card__body) {
        padding: 28px 32px 36px;
      }

    .article-edit-form {
      :deep(.el-form-item) {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        margin-bottom: 26px;
        width: 100%;
      }

      :deep(.el-form-item.form-row--markdown) {
        margin-bottom: 0;
      }

      :deep(.el-form-item.form-row--date) {
        margin-bottom: 28px;
      }

      :deep(.el-form-item.form-row--desc) {
        margin-top: 4px;
        margin-bottom: 28px;
      }

      :deep(.el-form-item__label) {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        line-height: 1.45;
        height: auto !important;
        padding: 0 0 10px 0;
        margin: 0;
        width: 100% !important;
        max-width: 100%;
        display: flex !important;
        align-items: center;
        justify-content: flex-start;
        gap: 6px;
        float: none !important;
        text-align: left;
      }

      :deep(.el-form-item__content) {
        line-height: 1.5;
        width: 100% !important;
        max-width: 100%;
        margin-left: 0 !important;
        flex: none;
      }

      .field-block {
        width: 100%;
      }

      .field-block--date {
        max-width: 320px;
      }

      :deep(.field-block--date .el-date-editor) {
        width: 100% !important;
        max-width: 100%;
      }

      :deep(.field-block--date .el-input__wrapper) {
        width: 100%;
      }

      :deep(.form-row--desc .el-textarea) {
        display: block;
      }

      :deep(.form-row--desc .el-input__count) {
        background: transparent;
        line-height: 1.2;
        margin-top: 6px;
        position: static;
        bottom: auto;
        right: auto;
        transform: none;
      }

      :deep(.form-row--desc .el-input) {
        display: block;
      }

      :deep(.el-input__wrapper) {
        border-radius: 10px;
        padding: 10px 14px;
        min-height: 44px;
        box-shadow: none;
        border: 1px solid #e5e7eb;
        background-color: #fafafa;
        transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      }

      :deep(.el-input__wrapper:hover) {
        border-color: #d1d5db;
        background-color: #fff;
      }

      :deep(.el-input__wrapper.is-focus) {
        border-color: #8b5cf6;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
      }

      :deep(.el-textarea__inner) {
        border-radius: 10px;
        padding: 12px 14px;
        min-height: 96px;
        border: 1px solid #e5e7eb;
        background-color: #fafafa;
        box-shadow: none;
        transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      }

      :deep(.el-textarea__inner:hover) {
        border-color: #d1d5db;
        background-color: #fff;
      }

      :deep(.el-textarea__inner:focus) {
        border-color: #8b5cf6;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
      }

      :deep(.el-select .el-select__wrapper) {
        border-radius: 10px;
        min-height: 44px;
        padding: 6px 12px;
        border: 1px solid #e5e7eb;
        background-color: #fafafa;
        box-shadow: none;
        transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      }

      :deep(.el-select .el-select__wrapper:hover) {
        border-color: #d1d5db;
        background-color: #fff;
      }

      :deep(.el-select .el-select__wrapper.is-focused) {
        border-color: #8b5cf6;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
      }

      :deep(.form-date.el-date-editor) {
        --el-date-editor-width: 100%;
      }

      :deep(.form-date .el-input__wrapper) {
        min-height: 44px;
      }

      .form-control {
        width: 100%;
      }

      .md-form-label {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        line-height: 1.45;
      }

      .md-form-label__title {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }

      .field-hint {
        font-size: 12px;
        font-weight: 400;
        color: #9ca3af;
        max-width: 520px;
      }

      .cover-upload {
        padding: 16px;
        background: linear-gradient(180deg, #fafafa 0%, #f3f4f6 100%);
        border-radius: 12px;
        border: 1px dashed #d1d5db;
        transition: border-color 0.2s, background 0.2s;

        &:hover {
          border-color: #c4b5fd;
          background: #faf5ff;
        }

        .cover-preview {
          position: relative;
          display: inline-block;
          margin-top: 0;

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

      .md-editor-page {
        width: 100%;
      }

      .md-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;

        .md-upload {
          display: inline-block;
        }
      }

      .md-panels {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        min-height: 520px;

        @media (max-width: 960px) {
          grid-template-columns: 1fr;
          min-height: auto;
        }
      }

      .md-panel {
        display: flex;
        flex-direction: column;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      }

      .md-panel__head {
        flex-shrink: 0;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
        border-bottom: 1px solid #e5e7eb;
      }

      .md-textarea {
        flex: 1;
        min-height: 480px;
        width: 100%;
        padding: 16px 18px;
        border: none;
        resize: vertical;
        font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
        font-size: 14px;
        line-height: 1.65;
        color: #111827;
        background: #fafafa;
        box-sizing: border-box;
        outline: none;

        &::placeholder {
          color: #9ca3af;
        }

        &:focus {
          background: #fff;
        }
      }

      .md-preview-scroll {
        flex: 1;
        min-height: 480px;
        /* Less 会误解析原生 CSS min()，需按字面量输出 */
        max-height: ~"min(70vh, 640px)";
        overflow: auto;
        padding: 16px 18px;
        background: #fff;
      }

      .markdown-body--live {
        font-size: 15px;
      }

      .md-meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-top: 12px;
        font-size: 13px;
        color: #6b7280;

        .saved {
          color: #16a34a;
        }

        .unsaved {
          color: #dc2626;
        }
      }
    }
    }
  }
}

.image-cropper-wrap {
  width: 100%;
  min-height: 360px;
  max-height: 60vh;
  overflow: hidden;
}

.image-cropper-source {
  display: block;
  max-width: 100%;
}

/* v2 使用自定义元素，需给画布容器明确高度以便选区正常显示 */
:deep(cropper-canvas) {
  display: block;
  width: 100%;
  height: ~"min(360px, 55vh)";
}
</style>
