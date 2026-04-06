<template>
  <div class="blog-header">
    <div class="nav">
      <div class="logo">
        <img src="@/assets/logo.jpg" alt="">
      </div>
      <div class="link">
        <router-link to="/home"> 首页 </router-link>
        <router-link to="/article"> 文章 </router-link>
        <router-link to="/my-articles"> 我的文章 </router-link>
        <router-link to="/profile"> 我的信息 </router-link>
        <router-link to="/about"> 关于 </router-link>
      </div>
    </div>
    <div class="control">
      <el-input size="large" :prefix-icon="Search" v-model="inputSearch" style="width: 240px" placeholder="搜索文章..." />
      <div class="user" v-if="!isLogin()">
        <router-link class="btn active" to="/login"> 登录 </router-link>
        <router-link class="btn" to="/register"> 注册 </router-link>
      </div>
      <div v-else class="user">
        <router-link class="btn active" to="/login" @click="logout"> 退出 </router-link>
      </div>
    </div>
  </div>
  <div class="box"></div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { isLogin } from '@/utils/isLogin.js'

const router = useRouter()
const inputSearch = ref('')

const logout = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.push('/login')
}
</script>

<style lang="less" scoped>
.blog-header {
  display: flex;
  height: 70px;
  justify-content: space-between;
  padding: 0 104px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  z-index: 100;

  .nav {
    display: flex;
    align-items: center;

    .logo {
      width: 120px;

      img {
        width: 100%;
      }
    }

    .link {
      margin-left: 32px;

      a {
        font-size: 16px;
        color: #374151;
        margin-right: 24px;

        &.router-link-exact-active {
          font-weight: 600;
          font-size: 18px;
          color: #8E6FF7;
        }
      }
    }
  }

  .control {
    display: flex;
    align-items: center;

    :deep(.el-input__wrapper) {
      border-radius: 8px;
      box-shadow: 0 0 0 1px #6B7280;
    }

    .user {
      .btn {
        display: inline-block;
        width: 64px;
        height: 40px;
        background: #E5E7EB;
        border-radius: 8px;
        text-align: center;
        line-height: 40px;
        color: #374151;
        margin-left: 16px;

        &.active {
          background: #8E6FF7;
          color: #fff;
        }
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        margin-left: 16px;

        img {
          width: 100%;
        }
      }
    }
  }
}

.box {
  height: 70px;
}
</style>