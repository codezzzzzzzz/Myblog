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

// 当前用户资料（需登录）
export const getUserProfile = async () => {
  return await axios.get('/user/profile')
}

export const updateUserProfile = async (params) => {
  return await axios.put('/user/profile', params)
}

export const uploadUserAvatar = async (formData) => {
  return await axios.post('/user/upload-avatar', formData)
}
// 点赞
export const addLikeApi = async (params) => {
  return await axios.get('/article/addLike', { params })
}

// 评论

// 获取我的文章列表
export const getMyArticles = async () => {
  return await axios.get('/article/my-articles')
}

// 创建文章
export const createArticle = async (params) => {
  return await axios.post('/article/create', params)
}

// 更新文章
export const updateArticle = async (params) => {
  return await axios.put('/article/update', params)
}

// 删除文章
export const deleteArticle = async (id) => {
  return await axios.delete('/article/delete', { data: { id } })
}

// 上传封面图片
export const uploadCover = async (formData) => {
  return await axios.post('/article/upload-cover', formData)
}

// 上传编辑器内图片
export const uploadImage = async (formData) => {
  return await axios.post('/article/upload-image', formData)
}
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
