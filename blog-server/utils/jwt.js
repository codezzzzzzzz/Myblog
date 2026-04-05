const jwt = require('jsonwebtoken')

function sign(option) {
  return jwt.sign(option, 'abc', {
    expiresIn: 86400  // 24小时过期
  })
}

// 解析token
function verify() {
  return async(ctx, next) => {
    let token = ctx.request.headers.authorization
    if (token) {
      // 校验
      try {
        const decoded = jwt.verify(token, 'abc')
        if (decoded.id) { // 合法的 token
          ctx.user_id = decoded.id
          await next()
        }
      } catch(err) {
        ctx.body = {
          code: 401,
          data: null,
          msg: 'token 已过期'
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