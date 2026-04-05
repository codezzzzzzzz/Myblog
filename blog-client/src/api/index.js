import axios from "./axios.js"

// 获取最新文章
export const getNewsArticleList = async () => {
  return await axios.get('/article/getNewsArticleList')
}

// 获取文章分类
export const getAllArticleCategory = async () => {
  return await axios.get('/article/getAllArticleCategory')
}

// 获取文章列表
export const getAllArticleList = async ({ page = 1, size = 5 }) => {
  return await axios.get('/article/getAllArticleList', {
    params: {
      page,
      size
    }
  })
}

// 根据id获取文章详情
export const getArticleDetailById = async (id) => {
  return await axios.get('/article/getArticleDetailById', {
    params: {
      id
    }
  })
}
// 用户登录
export const userLogin = async (params) => {
  return await axios.post('/user/login', params, { timeout: 15000 })
}

// 用户注册
export const userRegister = async (params) => {
  return await axios.post('/user/register', params, { timeout: 15000 })
}

// 归档列表（全部文章 id、title、create_time）
export const getArchiveList = async () => {
  return await axios.get('/article/getArchiveList')
}
// 点赞
export const addLikeApi = async (params) => {
  return await axios.get('/article/addLike', { params })
}

// 评论
export const addCommentApi = async (params) => {
  return await axios.post('/article/addComment', params)
}

// 获取评论
export const getCommentList = async (id) => {
  return await axios.get('/article/getCommentList', {
    params: {
      id
    }
  })
}
