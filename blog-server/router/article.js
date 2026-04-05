// 定义跟文章相关的接口
const Router = require('koa-router')
const router = new Router()
const {
  getNewsArticleList,
  getAllArticleCategory,
  getAllArticleList,
  getAllArticleCount,
  oneArticleTags,
  getArticleDetailById,
  getArchiveList,
  addLike,
  addComment,
  getCommentList
} = require('../controllers/index.js')
const { verify } = require('../utils/jwt.js')
const { sanitizeComment } = require('../utils/xss.js')


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

// 归档列表（用于归档页按年月分组）
router.get('/getArchiveList', async (ctx, next) => {
  try {
    const res = await getArchiveList()
    ctx.body = {
      code: 200,
      data: res || [],
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


module.exports = {
  articleRouter: router
}