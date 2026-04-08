<template>
  <div class="blog-profile">
    <layoutLeftRight>
      <template #left>
        <div class="profile-left">
          <div class="card">
            <div class="title">我的信息</div>
            <p class="desc">编辑头像、昵称与个人签名，将展示在文章详情页。</p>
          </div>

          <el-skeleton
            v-if="loading"
            animated
            :throttle="{ leading: 0 }"
            class="form-card form-card--skeleton"
          >
            <template #template>
              <div class="sk-profile-avatar-row">
                <span class="label">头像</span>
                <div class="sk-profile-avatar-col">
                  <el-skeleton-item variant="image" class="sk-profile-avatar" />
                  <el-skeleton-item variant="button" class="sk-profile-upload-btn" />
                  <el-skeleton-item variant="text" class="sk-profile-hint" />
                </div>
              </div>
              <el-skeleton-item variant="text" class="sk-form-label" />
              <el-skeleton-item variant="text" class="sk-form-input" />
              <el-skeleton-item variant="text" class="sk-form-label sk-form-label--2" />
              <el-skeleton-item variant="rect" class="sk-form-textarea" />
              <el-skeleton-item variant="button" class="sk-form-submit" />
            </template>
          </el-skeleton>
          <div v-else class="form-card">
            <div class="avatar-row">
              <span class="label">头像</span>
              <div class="avatar-wrap">
                <el-avatar :size="88" :src="avatarPreview" class="preview">
                  <span>{{ nicknameSlice }}</span>
                </el-avatar>
                <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  :before-upload="onBeforeAvatarUpload"
                >
                  <el-button type="primary" plain :loading="uploading">选择图片并裁剪</el-button>
                </el-upload>
                <p class="hint">jpg / png / gif / webp，原图最大 2MB；输出为正方形头像</p>
              </div>
            </div>

            <el-form label-position="top" @submit.prevent>
              <el-form-item label="昵称">
                <el-input v-model="nickname" maxlength="50" show-word-limit placeholder="显示名称" />
              </el-form-item>
              <el-form-item label="个人签名">
                <el-input
                  v-model="bio"
                  type="textarea"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                  placeholder="一句话介绍自己"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" color="#ff3b8d" :loading="saving" @click="saveProfile">保存资料</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </template>
      <template #right>
        <div class="profile-right">
          <Category />
          <Callme class="mt32" />
        </div>
      </template>
    </layoutLeftRight>

    <el-dialog
      v-model="cropDialogVisible"
      title="裁剪头像（1:1）"
      width="580px"
      append-to-body
      destroy-on-close
      @closed="onCropDialogClosed"
    >
      <div class="image-cropper-wrap">
        <img v-show="cropImageUrl" ref="cropImgRef" :src="cropImageUrl" alt="" class="image-cropper-source" />
      </div>
      <template #footer>
        <el-button @click="onCropCancel">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="onCropConfirm">确定并上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import layoutLeftRight from '@/components/layoutLeftRight.vue'
import Category from '@/components/Category.vue'
import Callme from '@/components/Callme.vue'
import { getUserProfile, updateUserProfile, uploadUserAvatar } from '@/api/index.js'
import { resolveMediaUrl, DEFAULT_AVATAR_URL } from '@/utils/mediaUrl.js'
import { cropperTemplateWithAspectRatio } from '@/utils/cropperV2Template.js'
import Cropper from 'cropperjs'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const AVATAR_CROP_TEMPLATE = cropperTemplateWithAspectRatio(1)
/** 输出头像边长（像素），兼顾清晰度与体积 */
const AVATAR_OUTPUT_SIZE = 400

const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const nickname = ref('')
const bio = ref('')
const avatarUrl = ref('')

const cropDialogVisible = ref(false)
const cropImageUrl = ref('')
const cropImgRef = ref(null)
const cropOriginalName = ref('avatar')
let cropperInstance = null

const avatarPreview = computed(() => {
  const u = resolveMediaUrl(avatarUrl.value)
  return u || DEFAULT_AVATAR_URL
})

const nicknameSlice = computed(() => (nickname.value ? nickname.value.slice(0, 1) : '我'))

function syncLocalUserInfo(partial) {
  try {
    const raw = localStorage.getItem('userInfo')
    const prev = raw ? JSON.parse(raw) : {}
    localStorage.setItem('userInfo', JSON.stringify({ ...prev, ...partial }))
  } catch (_) {}
}

const load = async () => {
  loading.value = true
  try {
    const res = await getUserProfile()
    const d = res.data
    nickname.value = d.nickname || ''
    bio.value = d.bio != null ? d.bio : ''
    avatarUrl.value = d.avatar || ''
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
})

onBeforeUnmount(() => {
  destroyCropper()
  if (cropImageUrl.value) {
    URL.revokeObjectURL(cropImageUrl.value)
    cropImageUrl.value = ''
  }
})

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
  cropperInstance = new Cropper(el, { template: AVATAR_CROP_TEMPLATE })
}

function openAvatarCrop(file) {
  cropOriginalName.value = file.name || 'avatar'
  if (cropImageUrl.value) URL.revokeObjectURL(cropImageUrl.value)
  cropImageUrl.value = URL.createObjectURL(file)
  cropDialogVisible.value = true
  nextTick(() => initCropper())
}

function onBeforeAvatarUpload(file) {
  const okType = /^image\/(jpeg|png|gif|webp)$/i.test(file.type || '')
  if (!okType) {
    ElMessage.error('请选择 jpg、png、gif 或 webp 图片')
    return false
  }
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片需小于 2MB')
    return false
  }
  openAvatarCrop(file)
  return false
}

const onCropCancel = () => {
  cropDialogVisible.value = false
}

const onCropConfirm = async () => {
  if (!cropperInstance) return
  const selection = cropperInstance.getCropperSelection()
  if (!selection) {
    ElMessage.error('裁剪区域未就绪')
    return
  }
  uploading.value = true
  try {
    const canvas = await selection.$toCanvas({
      width: AVATAR_OUTPUT_SIZE,
      height: AVATAR_OUTPUT_SIZE
    })
    destroyCropper()
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', 0.92)
    })
    const base = (cropOriginalName.value || 'avatar').replace(/\.[^.]+$/, '')
    const outFile = new File([blob], `${base}-avatar.jpg`, { type: 'image/jpeg' })

    const fd = new FormData()
    fd.append('avatar', outFile)
    const res = await uploadUserAvatar(fd)
    const u = res.data.user
    avatarUrl.value = u.avatar || ''
    syncLocalUserInfo({
      nickname: u.nickname,
      bio: u.bio,
      avatar: u.avatar
    })
    cropDialogVisible.value = false
    ElMessage.success(res.msg || '上传成功')
  } catch {
    ElMessage.error('裁剪或上传失败')
    destroyCropper()
    cropDialogVisible.value = false
  } finally {
    uploading.value = false
  }
}

const onCropDialogClosed = () => {
  destroyCropper()
  if (cropImageUrl.value) {
    URL.revokeObjectURL(cropImageUrl.value)
    cropImageUrl.value = ''
  }
}

const saveProfile = async () => {
  const name = nickname.value.trim()
  if (!name) {
    ElMessage.error('昵称不能为空')
    return
  }
  saving.value = true
  try {
    const res = await updateUserProfile({
      nickname: name,
      bio: bio.value.trim()
    })
    const d = res.data
    syncLocalUserInfo({
      nickname: d.nickname,
      bio: d.bio,
      avatar: d.avatar
    })
    nickname.value = d.nickname
    bio.value = d.bio != null ? d.bio : ''
    avatarUrl.value = d.avatar || ''
    ElMessage.success(res.msg || '保存成功')
  } catch (_) {
    // 拦截器已提示
  } finally {
    saving.value = false
  }
}
</script>

<style lang="less" scoped>
.blog-profile {
  .profile-left {
    .card {
      padding: 26px;
      background: var(--soft-surface-raised);
      border-radius: 0;
      border: 3px solid var(--px-ink);
      margin-bottom: 24px;
      box-shadow: var(--nu-raised);
      .title {
        font-size: 20px;
        font-weight: 700;
        color: var(--soft-text);
        line-height: 28px;
        margin-bottom: 8px;
        font-family: var(--font-display);
      }
      .desc {
        font-size: 16px;
        color: var(--soft-text-muted);
        line-height: 24px;
        font-weight: 500;
      }
    }

    .form-card--skeleton {
      padding: 28px 24px 32px;
      background: var(--soft-surface-raised);
      border-radius: 0;
      border: 3px solid var(--px-ink);
      box-shadow: var(--nu-raised);
    }
    .sk-profile-avatar-row {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(197, 206, 220, 0.45);
      .label {
        flex: 0 0 48px;
        font-size: 14px;
        color: var(--soft-text);
        font-weight: 600;
        padding-top: 8px;
      }
    }
    .sk-profile-avatar-col {
      flex: 1;
    }
    .sk-profile-avatar {
      width: 88px !important;
      height: 88px !important;
      margin-bottom: 12px !important;
    }
    .sk-profile-upload-btn {
      width: 168px !important;
      height: 32px !important;
      margin-bottom: 8px !important;
    }
    .sk-profile-hint {
      width: 280px !important;
      max-width: 100%;
    }
    .sk-form-label {
      width: 48px !important;
      margin-bottom: 8px !important;
    }
    .sk-form-label--2 {
      margin-top: 20px;
    }
    .sk-form-input {
      width: 100% !important;
      height: 40px !important;
      margin-bottom: 4px !important;
    }
    .sk-form-textarea {
      width: 100% !important;
      height: 96px !important;
      margin-bottom: 20px !important;
    }
    .sk-form-submit {
      width: 120px !important;
      height: 40px !important;
    }

    .form-card {
      padding: 28px 24px 32px;
      background: var(--soft-surface-raised);
      border-radius: 0;
      border: 3px solid var(--px-ink);
      box-shadow: var(--nu-raised);

      :deep(.el-input__wrapper) {
        border-radius: 0;
        background: var(--soft-read);
        border: 3px solid var(--px-ink);
        box-shadow: var(--nu-inset-sm);
      }

      :deep(.el-textarea__inner) {
        border-radius: 0;
        background: var(--soft-read);
        border: 3px solid var(--px-ink);
        box-shadow: var(--nu-inset-sm);
      }

      .avatar-row {
        display: flex;
        gap: 20px;
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid rgba(197, 206, 220, 0.45);

        .label {
          flex: 0 0 48px;
          font-size: 14px;
          color: var(--soft-text);
          font-weight: 600;
          padding-top: 8px;
        }

        .avatar-wrap {
          flex: 1;
          .preview {
            display: block;
            margin-bottom: 12px;
            box-shadow: var(--nu-raised-sm);
          }

          :deep(.el-avatar) {
            border-radius: 0 !important;
            border: 3px solid var(--px-ink);
            box-shadow: 3px 3px 0 var(--px-ink);
          }
          .hint {
            margin-top: 8px;
            font-size: 12px;
            color: var(--soft-text-muted);
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

:deep(cropper-canvas) {
  display: block;
  width: 100%;
  height: ~"min(360px, 55vh)";
}

.mt32 {
  margin-top: 32px;
}
</style>
