const jwt = require('jsonwebtoken')

function sign(option) {
  return jwt.sign(option, 'abc', {
    expiresIn: 86400 * 7 // 7 天；仅影响新签发的 token，旧 token 的 exp 以载荷为准
  })
}

function normalizeToken(raw) {
  if (raw == null) return ''
  const s = String(raw).trim()
  if (!s) return ''
  // 兼容 Authorization: Bearer <jwt>（大小写、多空格）
  return s.replace(/^Bearer\s+/i, '').trim()
}

// 解析token
function verify() {
  return async (ctx, next) => {
    let token = normalizeToken(ctx.request.headers.authorization)
    if (!token && ctx.request.body && ctx.request.body.token) {
      token = normalizeToken(ctx.request.body.token)
    }
    if (!token && ctx.request.query && ctx.request.query.token) {
      token = normalizeToken(String(ctx.request.query.token))
    }
    if (token) {
      try {
        const decoded = jwt.verify(token, 'abc', {
          clockTolerance: 120 // 本机与服务器时钟相差在 2 分钟内仍可通过（减轻轻微校时误差）
        })
        if (decoded.id != null) {
          ctx.user_id = decoded.id
          await next()
          return
        }
        ctx.body = {
          code: 401,
          data: null,
          msg: 'token 无效'
        }
      } catch (err) {
        const msg =
          err.name === 'TokenExpiredError'
            ? 'token 已过期'
            : err.name === 'JsonWebTokenError'
              ? 'token 无效'
              : 'token 校验失败'
        ctx.body = {
          code: 401,
          data: null,
          msg
        }
      }
    } else {
      ctx.body = {
        code: 401,
        data: null,
        msg: 'token 不存在'
      }
    }
  }
}

module.exports = {
  sign,
  verify
}