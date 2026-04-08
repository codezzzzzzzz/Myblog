<template>
  <div class="blog-header">
    <button
      type="button"
      class="nav-toggle"
      aria-label="打开导航菜单"
      :aria-expanded="drawerVisible"
      @click="drawerVisible = true"
    >
      <el-icon :size="22"><Menu /></el-icon>
    </button>

    <div class="nav">
      <router-link to="/home" class="logo" @click="onLogoNav">
        <img src="@/assets/logo.jpg" alt="首页">
      </router-link>
      <nav class="link" aria-label="主导航">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>

    <div class="control">
      <el-input
        class="header-search"
        size="large"
        :prefix-icon="Search"
        v-model="inputSearch"
        placeholder="搜索文章..."
        clearable
        @keyup.enter="submitSearch"
      />
      <div class="user" v-if="!isLogin()">
        <router-link class="btn active" to="/login">登录</router-link>
        <router-link class="btn btn--outline" to="/register">注册</router-link>
      </div>
      <div v-else class="user">
        <router-link class="btn active" to="/login" @click="logout">退出</router-link>
      </div>
    </div>
  </div>

  <el-drawer
    v-model="drawerVisible"
    direction="ltr"
    size="min(88vw, 300px)"
    append-to-body
    class="header-drawer"
    title="导航"
  >
    <div class="drawer-inner">
      <el-input
        class="drawer-search"
        size="large"
        :prefix-icon="Search"
        v-model="inputSearch"
        placeholder="搜索文章..."
        clearable
        @keyup.enter="submitSearchDrawer"
      />
      <nav class="drawer-nav" aria-label="移动端导航">
        <router-link
          v-for="item in navItems"
          :key="'d-' + item.to"
          :to="item.to"
          class="drawer-nav__link"
          @click="drawerVisible = false"
        >
          {{ item.label }}
        </router-link>
      </nav>
      <div class="drawer-auth">
        <template v-if="!isLogin()">
          <router-link class="btn drawer-btn active" to="/login" @click="drawerVisible = false">登录</router-link>
          <router-link class="btn drawer-btn" to="/register" @click="drawerVisible = false">注册</router-link>
        </template>
        <router-link
          v-else
          class="btn drawer-btn active"
          to="/login"
          @click="onLogoutDrawer"
        >
          退出
        </router-link>
      </div>
    </div>
  </el-drawer>

  <div class="box" aria-hidden="true"></div>
</template>

<script setup>
import { Search, Menu } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isLogin } from '@/utils/isLogin.js'

const router = useRouter()
const inputSearch = ref('')
const drawerVisible = ref(false)

const navItems = [
  { to: '/home', label: '首页' },
  { to: '/article', label: '文章' },
  { to: '/my-articles', label: '我的文章' },
  { to: '/profile', label: '我的信息' },
  { to: '/about', label: '关于' }
]

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    drawerVisible.value = false
  }
)

watch(
  () => router.currentRoute.value,
  (r) => {
    if (r.path === '/article' && typeof r.query.q === 'string') {
      inputSearch.value = r.query.q
    }
    if (r.path === '/article' && r.query.q == null) {
      inputSearch.value = ''
    }
  },
  { immediate: true }
)

function submitSearch() {
  const q = inputSearch.value.trim()
  router.push({ path: '/article', query: q ? { q } : {} })
}

function submitSearchDrawer() {
  submitSearch()
  drawerVisible.value = false
}

const onLogoNav = () => {
  drawerVisible.value = false
}

const logout = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

const onLogoutDrawer = () => {
  drawerVisible.value = false
  logout()
}
</script>

<style lang="less" scoped>
@bp-nav: 960px;

.blog-header {
  display: flex;
  height: var(--header-h);
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 0 max(var(--layout-page-pad), var(--safe-right)) 0 max(var(--layout-page-pad), var(--safe-left));
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 100;
  background: var(--soft-surface-raised);
  border-bottom: 4px solid var(--px-ink);
  box-shadow: 0 4px 0 var(--px-ink-mid);
  border-radius: 0;
  transition: transform var(--transition-soft), box-shadow var(--transition-soft);
}

.nav-toggle {
  display: none;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 3px solid var(--px-ink);
  border-radius: 0;
  background: var(--soft-accent-2);
  color: var(--px-ink);
  cursor: pointer;
  box-shadow: var(--nu-raised-sm);
  transition: box-shadow var(--transition-soft), transform var(--transition-soft);

  &:hover {
    box-shadow: var(--nu-hover);
    transform: translate(-1px, -1px);
  }

  &:active {
    box-shadow: var(--nu-pressed);
    transform: translate(2px, 2px);
  }
}

.nav {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;

  .logo {
    display: block;
    width: min(120px, 28vw);
    flex-shrink: 0;
    border-radius: 0;
    border: 3px solid var(--px-ink);
    box-shadow: var(--nu-raised-sm);
    padding: 2px 4px;
    box-sizing: border-box;
    background: var(--soft-read);

    img {
      width: 100%;
      display: block;
      border-radius: 0;
      image-rendering: pixelated;
    }
  }

  .link {
    margin-left: clamp(12px, 2vw, 28px);
    font-family: var(--font-display);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    min-width: 0;

    a {
      font-size: 14px;
      font-weight: 800;
      color: var(--soft-text);
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 0;
      border: 3px solid transparent;
      transition: color var(--transition-soft), box-shadow var(--transition-soft), background var(--transition-soft);
      white-space: nowrap;

      &:hover {
        background: rgba(255, 59, 141, 0.12);
        border-color: var(--px-ink);
        box-shadow: var(--nu-raised-sm);
      }

      &.router-link-exact-active,
      &.router-link-active {
        font-weight: 900;
        color: var(--px-ink);
        background: var(--soft-accent);
        border-color: var(--px-ink);
        box-shadow: var(--nu-raised-sm);
      }
    }
  }
}

.control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 0;

  :deep(.header-search) {
    width: 240px;
    max-width: min(240px, 36vw);
  }

  :deep(.header-search .el-input__wrapper) {
    border-radius: 0;
    background: var(--soft-read);
    box-shadow: var(--nu-inset-sm);
    border: 3px solid var(--px-ink);
    transition: box-shadow var(--transition-soft);
  }

  :deep(.header-search .el-input__wrapper.is-focus) {
    box-shadow: var(--nu-raised-sm);
  }

  .user {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 56px;
      height: 40px;
      padding: 0 12px;
      box-sizing: border-box;
      background: #ffe566;
      border: 3px solid var(--px-ink);
      border-radius: 0;
      text-align: center;
      line-height: 1;
      color: var(--px-ink);
      cursor: pointer;
      box-shadow: var(--nu-raised-sm);
      font-size: 13px;
      font-weight: 900;
      transition: box-shadow var(--transition-soft), transform var(--transition-soft), color var(--transition-soft);

      &:hover {
        box-shadow: var(--nu-hover);
        transform: translate(-1px, -1px);
      }

      &:active {
        box-shadow: var(--nu-pressed);
        transform: translate(2px, 2px);
      }

      &.active {
        background: var(--soft-accent);
        color: #fff;
        border-color: var(--px-ink);
        box-shadow: var(--nu-raised-sm);
      }

      &.btn--outline {
        background: var(--soft-read-solid);
        color: var(--soft-accent);
      }
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      margin-left: 8px;

      img {
        width: 100%;
      }
    }
  }
}

.box {
  height: var(--header-h);
}

@media (max-width: @bp-nav) {
  .nav-toggle {
    display: inline-flex;
  }

  .nav .link {
    display: none;
  }

  .nav {
    flex: 1;
    min-width: 0;
  }

  .control {
    :deep(.header-search) {
      display: none;
    }

    .user .btn {
      min-width: 52px;
      padding: 0 10px;
      font-size: 13px;
    }
  }
}

@media (max-width: 400px) {
  .control .user .btn--outline {
    display: none;
  }
}
</style>

<style lang="less">
/* 抽屉挂载到 body，不能用 scoped */
.header-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 4px solid var(--px-ink);
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--px-ink);
}

.header-drawer .el-drawer__body {
  padding: 16px;
  background: linear-gradient(180deg, #fff5fb 0%, #e8f8ff 100%);
}

.drawer-inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-search {
  width: 100%;
}

.drawer-search .el-input__wrapper {
  border-radius: 0;
  background: var(--soft-read);
  border: 3px solid var(--px-ink);
  box-shadow: var(--nu-inset-sm);
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drawer-nav__link {
  display: block;
  padding: 14px 16px;
  border-radius: 0;
  font-size: 15px;
  font-weight: 900;
  color: var(--px-ink);
  background: var(--soft-read-solid);
  border: 3px solid var(--px-ink);
  box-shadow: var(--nu-raised-sm);
  transition: box-shadow var(--transition-soft), color var(--transition-soft), transform var(--transition-soft);
  font-family: var(--font-sans);

  &:hover {
    color: var(--soft-accent);
    transform: translate(-1px, -1px);
    box-shadow: var(--nu-hover);
  }

  &.router-link-exact-active,
  &.router-link-active {
    color: #fff;
    background: var(--soft-accent);
    box-shadow: var(--nu-raised-sm);
  }
}

.drawer-auth {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 12px;
  border-top: 4px dashed var(--px-ink-mid);
}

.drawer-btn {
  flex: 1;
  min-width: 100px;
  justify-content: center;
  height: 44px;
  line-height: 44px;
  text-align: center;
  border-radius: 0;
  font-weight: 900;
  border: 3px solid var(--px-ink);
  box-shadow: var(--nu-raised-sm);
  cursor: pointer;
  transition: box-shadow var(--transition-soft), transform var(--transition-soft);

  &.active {
    background: var(--soft-accent);
    color: #fff !important;
  }

  &:not(.active) {
    background: #ffe566;
    color: var(--px-ink);
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: var(--nu-pressed);
  }
}
</style>
