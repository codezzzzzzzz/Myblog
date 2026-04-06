const Router = require('koa-router')
const router = new Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const {
  userLogin,
  userRegister,
  getUserProfileById,
  updateUserProfile,
  updateUserAvatar
} = require('../controllers/index.js')
const { sign, verify } = require('../utils/jwt.js')
const { getPublicOrigin } = require('../utils/publicOrigin.js')

router.prefix('/user')

const avatarDir = path.join(__dirname, '../uploads/avatars')
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true })
}

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg'
    const safeExt = /^\.(jpe?g|png|gif|webp)$/i.test(ext) ? ext.toLowerCase() : '.jpg'
    cb(null, 'avatar-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + safeExt)
  }
})

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)
    if (ok) cb(null, true)
    else cb(new Error('仅支持 jpg、png、gif、webp 图片'))
  }
})

function koaMulter(mw) {
  return async (ctx, next) => {
    await new Promise((resolve, reject) => {
      mw(ctx.req, ctx.res, (err) => (err ? reject(err) : resolve()))
    })
    await next()
  }
}

function tryRemoveOldAvatarFile(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== 'string') return
  const m = avatarUrl.match(/\/avatars\/([^/?#]+)$/i)
  if (!m) return
  const fp = path.join(avatarDir, m[1])
  if (fs.existsSync(fp)) {
    try {
      fs.unlinkSync(fp)
    } catch (_) {}
  }
}

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
        avatar: res[0].avatar || '',
        bio: res[0].bio != null ? res[0].bio : ''
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

// 当前用户资料（需登录）
router.get('/profile', verify(), async (ctx) => {
  try {
    const rows = await getUserProfileById(ctx.user_id)
    if (!rows.length) {
      ctx.body = { code: 404, msg: '用户不存在' }
      return
    }
    const u = rows[0]
    ctx.body = {
      code: 200,
      data: {
        id: u.id,
        username: u.username,
        nickname: u.nickname,
        avatar: u.avatar || '',
        bio: u.bio != null ? u.bio : '',
        create_time: u.create_time
      },
      msg: '查询成功'
    }
  } catch (error) {
    ctx.body = { code: 500, data: error, msg: '服务器异常' }
  }
})

// 更新昵称、签名（需登录）
router.put('/profile', verify(), async (ctx) => {
  const body = ctx.request.body || {}
  let nickname = typeof body.nickname === 'string' ? body.nickname.trim() : ''
  const bio = typeof body.bio === 'string' ? body.bio.trim().slice(0, 500) : ''
  if (!nickname) {
    ctx.body = { code: 400, msg: '昵称不能为空' }
    return
  }
  if (nickname.length > 50) {
    ctx.body = { code: 400, msg: '昵称最多 50 个字符' }
    return
  }
  try {
    await updateUserProfile(ctx.user_id, nickname, bio)
    const rows = await getUserProfileById(ctx.user_id)
    const u = rows[0]
    ctx.body = {
      code: 200,
      data: {
        id: u.id,
        username: u.username,
        nickname: u.nickname,
        avatar: u.avatar || '',
        bio: u.bio != null ? u.bio : ''
      },
      msg: '保存成功'
    }
  } catch (error) {
    ctx.body = { code: 500, data: error, msg: '服务器异常' }
  }
})

// 上传头像（需登录，文件保存在 uploads/avatars）
router.post('/upload-avatar', verify(), koaMulter(avatarUpload.single('avatar')), async (ctx) => {
  try {
    const file = ctx.req.file
    if (!file) {
      ctx.body = { code: 400, data: null, msg: '请选择图片文件' }
      return
    }
    const rows = await getUserProfileById(ctx.user_id)
    const oldAvatar = rows[0] && rows[0].avatar
    tryRemoveOldAvatarFile(oldAvatar)

    const imageUrl = `${getPublicOrigin(ctx)}/avatars/${file.filename}`
    await updateUserAvatar(ctx.user_id, imageUrl)

    const fresh = await getUserProfileById(ctx.user_id)
    const u = fresh[0]
    ctx.body = {
      code: 200,
      data: {
        url: imageUrl,
        user: {
          id: u.id,
          username: u.username,
          nickname: u.nickname,
          avatar: u.avatar || '',
          bio: u.bio != null ? u.bio : ''
        }
      },
      msg: '上传成功'
    }
  } catch (error) {
    const msg = error.message && String(error.message).includes('仅支持')
      ? error.message
      : '服务器异常'
    ctx.body = { code: 500, data: error, msg }
  }
})

module.exports = {
  userRouter: router
}