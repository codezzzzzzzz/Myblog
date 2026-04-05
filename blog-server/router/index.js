// 所有路由生效
const { articleRouter } = require('./article.js')
const { userRouter } = require('./user.js')

const routerArr = [
  articleRouter,
  userRouter
]

const useRouters = (app) => {
  routerArr.forEach(router => {
    app.use(
      router.routes(), // 路由中的回调会被触发
      router.allowedMethods()
    )
  })
}

module.exports = useRouters
