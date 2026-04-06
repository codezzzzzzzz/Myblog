<template>
  <div class="login">
    <div class="login-hd">
      <div class="login-logo">
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
        <el-button class="login-btn" size="large" color="#71377E" @click="login">登录</el-button>
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
  height: 100vh;
  background: linear-gradient(145deg, #FAF5FF 0%, #FFFFFF 100%);
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

      img {
        width: 100%;
      }
    }
  }

  .login-wrap {
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

    .login-form {
      .input {
        --el-input-focus-border-color: #71377E;
        margin-bottom: 24px;
      }

      .remember {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .el-checkbox {
          --el-checkbox-text-color: #4B5563;
          font-weight: 400;
          --el-checkbox-checked-text-color: #71377E;
          --el-checkbox-input-border-color-hover: #71377E;
          --el-checkbox-checked-input-border-color: #71377E;
          --el-checkbox-checked-bg-color: #71377E;
        }

        a {
          font-weight: 400;
          font-size: 14px;
          color: #71377E;
          line-height: 20px;
        }
      }

      .login-btn {
        margin-top: 24px;
        width: 100%;
      }

      .go-register {
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

  .login-ft {
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