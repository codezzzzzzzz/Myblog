// 定义跟文章相关的接口
const Router = require('koa-router')
const router = new Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const {
  getNewsArticleList,
  getAllArticleCategory,
  getAllArticleList,
  getAllArticleCount,
  oneArticleTags,
  getArticleDetailById,
  addLike,
  addComment,
  getCommentList,
  getMyArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  addArticleTags,
  deleteArticleTags
} = require('../controllers/index.js')
const { verify } = require('../utils/jwt.js')
const { sanitizeComment } = require('../utils/xss.js')
const { getPublicOrigin } = require('../utils/publicOrigin.js')

// 确保uploads目录存在
const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

const upload = multer({ storage: storage })

function koaMulter(mw) {
  return async (ctx, next) => {
    await new Promise((resolve, reject) => {
      mw(ctx.req, ctx.res, (err) => (err ? reject(err) : resolve()))
    })
    await next()
  }
}

// 路由前缀
router.prefix('/article')


// 获取最新文章列表
router.get('/getNewsArticleList', async (ctx, next) => {
  try {
    const res = await getNewsArticleList()
    if (res.length) { // 有数据
      ctx.body = {
        code: 200,
        data: res,
        msg: '查询成功'
      }
    } else { // 没有数据
      ctx.body = {
        code: 200,
        data: [],
        msg: '暂无数据'
      }
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 文章分类
router.get('/getAllArticleCategory', async (ctx, next) => {
  try {
    const res = await getAllArticleCategory()
    if (res.length) {
      ctx.body = {
        code: 200,
        data: res,
        msg: '查询成功'
      }
    } else {
      ctx.body = {
        code: 200,
        data: [],
        msg: '暂无数据'
      }
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 所有文章
router.get('/getAllArticleList', async (ctx, next) => {
  const { page, size } = ctx.query
  try {
    const res = await getAllArticleList({ page, size })  // 查询所有文章
    const total = await getAllArticleCount()  // 查询文章总数量
    const tags = await oneArticleTags()  // 查询文章标签

    res.forEach(item => {
      tags.forEach(tag => {
        if (item.id === tag.article_id) {
          item.tag_names = tag.tag_names
        }
      })
    })

    if (res.length) {
      ctx.body = {
        code: 200,
        data: res,
        totalPage: Math.ceil(total[0].count / Number(size)),
        msg: '查询成功'
      }
    } else {
      ctx.body = {
        code: 200,
        data: [],
        totalPage: 0,
        msg: '暂无数据'
      }
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }

})

// 根据id查询文章
router.get('/getArticleDetailById', async (ctx, next) => {
  const { id } = ctx.query
  try {
    const res = await getArticleDetailById(id)
    if (res.length) {
      ctx.body = {
        code: 200,
        data: res[0],
        msg: '查询成功'
      }
    } else {
      ctx.body = {
        code: 200,
        data: {},
        msg: '暂无数据'
      }
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 文章点赞  (校验 token)
router.get('/addLike', verify(), async (ctx, next) => {
  // 文章id， 用户id
  const { article_id } = ctx.query
  const user_id = ctx.user_id
  try {
    const res = await addLike(article_id, user_id)
    if (res.affectedRows) {
      ctx.body = {
        code: 200,
        data: 'success',
        msg: '点赞成功'
      }
    } else {
      ctx.body = {
        code: 200,
        data: null,
        msg: res.msg
      }
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 评论
router.post('/addComment', verify(), async (ctx, next) => {
  const { article_id, comment } = ctx.request.body
  const user_id = ctx.user_id
  if (!sanitizeComment(comment)) {
    ctx.body = {
      code: 400,
      data: null,
      msg: '评论内容不合法'
    }
    return
  }

  try {
    const res = await addComment(article_id, sanitizeComment(comment), user_id)
    if (res.affectedRows) {
      ctx.body = {
        code: 200,
        data: 'success',
        msg: '评论成功'
      }
    } else {
      ctx.body = {
        code: 200,
        data: null,
        msg: '评论失败'
      }
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 获取文章评论
router.get('/getCommentList', async (ctx, next) => {
  const { id } = ctx.query
  try {
    // 将该article_id的评论查询出来，并关联用户表
    // 按照时间倒序排列
    const res = await getCommentList(id)
    if (res.length) {
      ctx.body = {
        code: 200,
        data: res,
        msg: '查询成功'
      }
    } else {
      ctx.body = {
        code: 200,
        data: [],
        msg: '暂无数据'
      }
    }

  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 获取我的文章列表
router.get('/my-articles', verify(), async (ctx, next) => {
  const user_id = ctx.user_id
  try {
    const res = await getMyArticles(user_id)
    ctx.body = {
      code: 200,
      data: res,
      msg: '查询成功'
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 创建文章
router.post('/create', verify(), async (ctx, next) => {
  const { title, content, create_time, cover_pic, article_desc, tags } = ctx.request.body
  const user_id = ctx.user_id
  try {
    const res = await createArticle(title, content, create_time, user_id, cover_pic, article_desc)
    if (res.insertId && tags && tags.length > 0) {
      await addArticleTags(res.insertId, tags)
    }
    ctx.body = {
      code: 200,
      data: res,
      msg: '创建成功'
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 更新文章
router.put('/update', verify(), async (ctx, next) => {
  const { id, title, content, create_time, cover_pic, article_desc, tags } = ctx.request.body
  const user_id = ctx.user_id
  try {
    const res = await updateArticle(id, title, content, create_time, cover_pic, article_desc, user_id)
    if (res.affectedRows && tags) {
      await deleteArticleTags(id)
      if (tags.length > 0) {
        await addArticleTags(id, tags)
      }
    }
    ctx.body = {
      code: 200,
      data: res,
      msg: '更新成功'
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 删除文章
router.delete('/delete', verify(), async (ctx, next) => {
  const { id } = ctx.request.body
  const user_id = ctx.user_id
  try {
    await deleteArticleTags(id)
    const res = await deleteArticle(id, user_id)
    ctx.body = {
      code: 200,
      data: res,
      msg: '删除成功'
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 上传封面图片
router.post('/upload-cover', verify(), koaMulter(upload.single('cover')), async (ctx, next) => {
  try {
    const file = ctx.req.file
    if (!file) {
      ctx.body = {
        code: 400,
        data: null,
        msg: '请选择文件'
      }
      return
    }
    const imageUrl = `${getPublicOrigin(ctx)}/${file.filename}`
    ctx.body = {
      code: 200,
      data: { url: imageUrl, filename: file.filename },
      msg: '上传成功'
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 上传编辑器内图片
router.post('/upload-image', verify(), koaMulter(upload.single('image')), async (ctx, next) => {
  try {
    const file = ctx.req.file
    if (!file) {
      ctx.body = {
        code: 400,
        data: null,
        msg: '请选择文件'
      }
      return
    }
    const imageUrl = `${getPublicOrigin(ctx)}/${file.filename}`
    ctx.body = {
      code: 200,
      data: { url: imageUrl, filename: file.filename },
      msg: '上传成功'
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      data: error,
      msg: '服务器异常'
    }
  }
})

// 静态文件服务
router.get('/uploads/:filename', async (ctx, next) => {
  const { filename } = ctx.params
  const filePath = path.join(uploadDir, filename)
  try {
    if (fs.existsSync(filePath)) {
      ctx.type = path.extname(filename)
      ctx.body = fs.createReadStream(filePath)
    } else {
      ctx.status = 404
      ctx.body = { code: 404, msg: '文件不存在' }
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = { code: 500, msg: '服务器异常' }
  }
})

module.exports = {
  articleRouter: router
}