// 数据库的配置，node 想要链接 mysql数据库，
// 需要知道数据库的账号，密码 和数据库的名字，还有数据库的端口号
// 密码优先从环境变量 MYSQL_PASSWORD 读取（避免把真实密码提交到仓库），没有则用下面的默认值
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const dataBase = {
  DATABASE: process.env.MYSQL_DATABASE || 'blog',
  USERNAME: process.env.MYSQL_USERNAME || 'root',
  PASSWORD: process.env.MYSQL_PASSWORD || '12345678',
  PORT: process.env.MYSQL_PORT || '3306',
  HOST: process.env.MYSQL_HOST || 'localhost'
}

module.exports = dataBase