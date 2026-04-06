const Koa = require('koa')
const app = new Koa()
const useRouters = require('./router/index.js')
const cors = require('@koa/cors');
const { bodyParser } = require("@koa/bodyparser");
const serve = require('koa-static');
const path = require('path');

// 解决跨域
app.use(cors());

// 解析请求体（默认不含 DELETE，会导致 axios.delete 传的 JSON body 拿不到 id）
app.use(bodyParser({ parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] }))

// 静态文件服务
app.use(serve(path.join(__dirname, 'uploads')));

// 提供前端可以访问的接口
useRouters(app)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('server is running at port', PORT)
})