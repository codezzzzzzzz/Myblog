const Koa = require('koa')
const app = new Koa()
const useRouters = require('./router/index.js')
const cors = require('@koa/cors');
const { bodyParser } = require("@koa/bodyparser");

// 解决跨域
app.use(cors());

// 解析post请求的参数
app.use(bodyParser());


// 提供前端可以访问的接口
useRouters(app)


// app.use((ctx, next) => {
//   if (ctx.url === '/home') { // 用路由的方式
//     // 链接数据库
//     // 查数据库
//     // 返回数据
//     ctx.body = '返回数据'
//   }
// })
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('server is running at port', PORT)
})