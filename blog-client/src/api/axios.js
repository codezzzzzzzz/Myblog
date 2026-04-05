// 封装 axios 做一些公共的配置，以及错误统一处理
import axios from 'axios'

// ✅ 开发环境用 localhost，生产环境用 /api（由Nginx代理转发）
axios.defaults.baseURL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : '/api'  // 👈 👈 👈 这里改成 /api 就彻底通了！

axios.defaults.headers.post['Content-Type'] = 'application/json'

// 请求拦截器
axios.interceptors.request.use(req => {
  let token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    req.headers.Authorization = token
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
      ElMessage.error(res.data.msg)
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