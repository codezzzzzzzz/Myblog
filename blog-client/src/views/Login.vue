<template>
  <div class="login">
    <div class="login-hd">

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
              <el-dropdown-item>Action 2</el-dropdown-item>
              <el-dropdown-item>Action 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="login-wrap">
      <div class="title">欢迎回来</div>
      <div class="desc">探索技术的无限可能</div>
      <div class="login-form">
        <el-input prefix-icon="User" class="username input" size="large" v-model="username" placeholder="请输入用户名" />
        <el-input prefix-icon="Lock" class="password input" size="large" v-model="password" placeholder="请输入密码" />
        <div class="remember">
          <el-checkbox v-model="remember" label="记住我" size="default" />
          <router-link to="/forget-password">忘记密码？</router-link>
        </div>
        <el-button class="login-btn" size="large" color="#ff3b8d" @click="login">登录</el-button>
        <div class="go-register">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </div>
    </div>
    <div class="login-ft">© 2024 技术博客. 保留所有权利</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import md5 from 'md5'
import { userLogin } from '@/api/index.js'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const remember = ref(false)
const router = useRouter()

const login = async () => {
  if (username.value === '' || password.value === '') {
    ElMessage.error('账号或密码不能为空')
    return
  }
  try {
    const res = await userLogin({ username: username.value, password: md5(password.value) })
    // axios 优先读 localStorage 再读 sessionStorage；只写一侧时必须清空另一侧，否则会一直带上过期的旧 token
    if (remember.value) {
      localStorage.setItem('token', res.token)
      sessionStorage.removeItem('token')
    } else {
      localStorage.removeItem('token')
      sessionStorage.setItem('token', res.token)
    }
    localStorage.setItem('userInfo', JSON.stringify(res.data))
    ElMessage.success('登录成功')
    router.back()
  } catch (e) {
    // 账号错误等已由 axios 拦截器提示
  }
}
</script>

<style lang="less" scoped>
.login {
  width: 100vw;
  min-height: 100vh;
  background: var(--soft-bg);
  background-image: linear-gradient(165deg, var(--soft-bg-top) 0%, var(--soft-bg) 50%, #dfe5ef 100%);
  position: relative;

  .login-hd {
    width: 100%;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    box-sizing: border-box;

    .login-logo {
      width: 150px;
      height: 40px;
      border-radius: 0;
      padding: 4px 8px;
      border: 3px solid var(--px-ink);
      box-shadow: var(--nu-raised-sm);
      background: var(--soft-read);

      img {
        width: 100%;
        display: block;
        border-radius: 0;
      }
    }
  }

  .login-wrap {
    width: min(448px, calc(100vw - 40px));
    background: var(--soft-surface-raised);
    box-shadow: var(--nu-raised);
    border-radius: 0;
    border: 3px solid var(--px-ink);
    padding: 36px 32px;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .title {
      font-weight: 700;
      font-size: 24px;
      color: var(--soft-text);
      line-height: 32px;
      text-align: center;
      margin-bottom: 8px;
      font-family: var(--font-display);
    }

    .desc {
      font-weight: 500;
      font-size: 16px;
      color: var(--soft-text-muted);
      line-height: 24px;
      text-align: center;
      margin-bottom: 32px;
    }

    .login-form {
      .input {
        --el-input-focus-border-color: var(--soft-accent);
        margin-bottom: 24px;
      }

      :deep(.el-input__wrapper) {
        border-radius: 0;
        background: var(--soft-read);
        border: 3px solid var(--px-ink);
        box-shadow: var(--nu-inset-sm);
      }

      :deep(.el-input__wrapper.is-focus) {
        box-shadow: var(--nu-raised-sm);
      }

      .remember {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .el-checkbox {
          --el-checkbox-text-color: var(--soft-text-muted);
          font-weight: 500;
          --el-checkbox-checked-text-color: var(--soft-accent);
          --el-checkbox-input-border-color-hover: var(--soft-accent);
          --el-checkbox-checked-input-border-color: var(--soft-accent);
          --el-checkbox-checked-bg-color: var(--soft-accent);
        }

        a {
          font-weight: 600;
          font-size: 14px;
          color: var(--soft-accent);
          line-height: 20px;
          cursor: pointer;

          &:hover {
            color: var(--soft-accent-hover);
          }
        }
      }

      .login-btn {
        margin-top: 24px;
        width: 100%;
        border-radius: 0;
        border: 3px solid var(--px-ink) !important;
        box-shadow: var(--nu-raised) !important;
      }

      .go-register {
        margin-top: 24px;
        font-weight: 500;
        font-size: 16px;
        color: var(--soft-text-muted);
        line-height: 24px;
        text-align: center;

        a {
          color: var(--soft-accent);
          font-weight: 600;
          cursor: pointer;

          &:hover {
            color: var(--soft-accent-hover);
          }
        }
      }
    }
  }

  .login-ft {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 72px;
    line-height: 72px;
    text-align: center;
    font-weight: 500;
    font-size: 15px;
    color: var(--soft-text-muted);
  }
}
</style>