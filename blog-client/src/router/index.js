import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/article',
    name: 'article',
    component: () => import('@/views/Article.vue')
  },
  {
    path: '/detail',
    name: 'detail',
    component: () => import('@/views/Detail.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/conclude',
    name: 'conclude',
    component: () => import('@/views/Conclude.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/About.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/forget-password',
    name: 'forget-password',
    component: () => import('@/views/ForgetPassword.vue')
  },
  {
    path: '/my-articles',
    name: 'my-articles',
    component: () => import('@/views/MyArticles.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-article',
    name: 'edit-article',
    component: () => import('@/views/EditArticle.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-article/:id',
    name: 'edit-article-detail',
    component: () => import('@/views/EditArticle.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  let token = localStorage.getItem('token')
  if (!token) {
    token = sessionStorage.getItem('token')
  }

  if (requiresAuth && !token) {
    ElMessage.error('请先登录')
    console.log(token)
    next('/login')
  } else {
    next()
  }
})

export default router