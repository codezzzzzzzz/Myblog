// 封装 axios 做一些公共的配置，以及错误统一处理
import axios from 'axios'
import { ElMessage } from 'element-plus'

// ✅ 开发环境用 localhost，生产环境用 /api（由Nginx代理转发）
axios.defaults.baseURL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : '/api'  // 👈 👈 👈 这里改成 /api 就彻底通了！

// 请求拦截器（与 Login/Register 约定：只应在一侧存有 token；localStorage 优先于 sessionStorage）
// 注意：服务端 jwt.verify 使用完整字符串；不要擅自加 Bearer，否则与旧版服务端/部分环境组合可能校验失败
axios.interceptors.request.use(req => {
  const raw = localStorage.getItem('token') || sessionStorage.getItem('token')
  const token = raw ? String(raw).trim() : ''
  if (token) {
    req.headers.Authorization = token.replace(/^Bearer\s+/i, '')
  }
  return req
})

// 响应拦截器
axios.interceptors.response.use(res => {
  if (res.status !== 200) {
    ElMessage.error('服务器异常')
    return Promise.reject(res)
  } else {
    if (res.data.code === 401) {
      ElMessage.error(res.data.msg || '登录已失效，请重新登录')
      return Promise.reject(res)
    }
    if (res.data.code !== 200) {
      ElMessage.error(res.data.msg)
      return Promise.reject(res)
    }
    return res.data
  }
})

export default axios