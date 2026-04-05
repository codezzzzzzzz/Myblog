<template>
  <div class="register">
    <div class="register-hd">
      <div class="register-logo">
        <img src="@/assets/logo.jpg" alt="">
      </div>
      <div class="i18n">
        <el-dropdown>
          <span class="el-dropdown-link">
            中文
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="register-wrap">
      <div class="title">创建账号</div>
      <div class="desc">加入我们，分享你的技术见解</div>
      <div class="register-form">
        <el-input prefix-icon="User" class="input" size="large" v-model="username" placeholder="请输入用户名" />
        <el-input prefix-icon="UserFilled" class="input" size="large" v-model="nickname" placeholder="昵称（选填）" />
        <el-input prefix-icon="Lock" class="input" size="large" v-model="password" type="password" placeholder="请输入密码"
          show-password />
        <el-input prefix-icon="Lock" class="input" size="large" v-model="passwordAgain" type="password"
          placeholder="请再次输入密码" show-password />
        <div class="tip">用户名 2～20 个字符，支持字母、数字、下划线和中文；密码至少 6 位</div>
        <el-button class="register-btn" size="large" color="#71377E" :loading="loading" @click="register">注册</el-button>
        <div class="go-login">
          已有账号？
          <router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </div>
    <div class="register-ft">© 2024 技术博客. 保留所有权利</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import md5 from 'md5'
import { userRegister, userLogin } from '@/api/index.js'
import { useRouter } from 'vue-router'

const username = ref('')
const nickname = ref('')
const password = ref('')
const passwordAgain = ref('')
const loading = ref(false)
const router = useRouter()

const register = async () => {
  const name = username.value.trim()
  if (!name) {
    ElMessage.error('请输入用户名')
    return
  }
  if (name.length < 2 || name.length > 20) {
    ElMessage.error('用户名长度为 2～20 个字符')
    return
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(name)) {
    ElMessage.error('用户名仅支持字母、数字、下划线和中文')
    return
  }
  if (!password.value) {
    ElMessage.error('请输入密码')
    return
  }
  if (password.value.length < 6) {
    ElMessage.error('密码至少 6 位')
    return
  }
  if (password.value !== passwordAgain.value) {
    ElMessage.error('两次密码不一致')
    return
  }
  loading.value = true
  try {
    await userRegister({
      username: name,
      nickname: nickname.value.trim() || undefined,
      password: md5(password.value)
    })
    // 注册成功后自动登录并进入主页
    const loginRes = await userLogin({
      username: name,
      password: md5(password.value)
    })
    localStorage.removeItem('token')
    sessionStorage.setItem('token', loginRes.token)
    localStorage.setItem('userInfo', JSON.stringify(loginRes.data))
    ElMessage.success('注册成功')
    router.push('/home')
  } catch (e) {
    if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
      ElMessage.error('请求超时，请检查网络或稍后重试')
    }
    // 其他接口错误已在 axios 拦截器里 ElMessage
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.register {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(145deg, #FAF5FF 0%, #FFFFFF 100%);
  position: relative;

  .register-hd {
    width: 100%;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    box-sizing: border-box;

    .register-logo {
      width: 150px;
      height: 40px;

      img {
        width: 100%;
      }
    }
  }

  .register-wrap {
    width: 448px;
    background: #FFFFFF;
    box-shadow: 0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    padding: 32px;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .title {
      font-weight: 700;
      font-size: 24px;
      color: #1F2937;
      line-height: 32px;
      text-align: center;
      margin-bottom: 8px;
    }

    .desc {
      font-weight: 400;
      font-size: 16px;
      color: #4B5563;
      line-height: 24px;
      text-align: center;
      margin-bottom: 32px;
    }

    .register-form {
      .input {
        --el-input-focus-border-color: #71377E;
        margin-bottom: 24px;
      }

      .tip {
        font-size: 12px;
        color: #6B7280;
        line-height: 18px;
        margin-bottom: 16px;
      }

      .register-btn {
        margin-top: 0;
        width: 100%;
      }

      .go-login {
        margin-top: 24px;
        font-weight: 400;
        font-size: 16px;
        color: #4B5563;
        line-height: 24px;
        text-align: center;

        a {
          color: #71377E;
        }
      }
    }
  }

  .register-ft {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 72px;
    line-height: 72px;
    text-align: center;
    font-weight: 400;
    font-size: 16px;
    color: #4B5563;
  }
}
</style>
