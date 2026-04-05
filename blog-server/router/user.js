const Router = require('koa-router')
const router = new Router()
const { userLogin, userRegister } = require('../controllers/index.js')
const { sign } = require('../utils/jwt.js')

router.prefix('/user')

// 登录接口
router.post('/login', async (ctx, next) => {
  const { username, password } = ctx.request.body  // post请求的数据
  try {
    const res = await userLogin(username, password)
    if (res.length) {  // 账号密码正确
      const data = {
        username: res[0].username,
        nickname: res[0].nickname,
        id: res[0].id,
        avatar: res[0].avatar
      }
      const token = sign({
        id: res[0].id,
        username: res[0].username
      })
      ctx.body = {
        code: 200,
        data: data,
        token: token,
        msg: '登录成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '账号或密码错误'
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

// 注册接口
router.post('/register', async (ctx, next) => {
  const body = ctx.request.body || {}
  const { username, password, nickname } = body
  const name = typeof username === 'string' ? username.trim() : ''
  const pwd = typeof password === 'string' ? password : ''
  if (!name) {
    ctx.body = { code: 400, msg: '用户名不能为空' }
    return
  }
  if (name.length < 2 || name.length > 20) {
    ctx.body = { code: 400, msg: '用户名长度为 2～20 个字符' }
    return
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(name)) {
    ctx.body = { code: 400, msg: '用户名仅支持字母、数字、下划线和中文' }
    return
  }
  if (!pwd) {
    ctx.body = { code: 400, msg: '密码不能为空' }
    return
  }
  if (pwd.length !== 32) {
    ctx.body = { code: 400, msg: '密码格式异常，请刷新后重试' }
    return
  }
  try {
    await userRegister(name, pwd, nickname)
    ctx.body = { code: 200, msg: '注册成功，请登录' }
  } catch (error) {
    ctx.body = {
      code: 500,
      msg: error.message || '注册失败'
    }
  }
})

module.exports = {
  userRouter: router
}