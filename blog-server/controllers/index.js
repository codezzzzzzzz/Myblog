// 导入模块
const mysql = require('mysql2/promise');
const dataBase = require('../config/index.js');

// 创建连接池（连接超时 10 秒，避免卡死）
const pool = mysql.createPool({
  host: dataBase.HOST,
  user: dataBase.USERNAME,
  password: dataBase.PASSWORD,
  database: dataBase.DATABASE,
  port: dataBase.PORT,
  connectTimeout: 10000
});

// mysql的连接
const allServices = {
  async query(sql, values) {
    try {
      const conn = await pool.getConnection();  // 等待连接池连接
      const [rows, fields] = await conn.query(sql, values); // 执行sql语句
      pool.releaseConnection(conn); // 释放连接
      return Promise.resolve(rows);

    } catch (error) {
      return Promise.reject(error);
    }

  }
}

// 获取最新文章列表
const getNewsArticleList = () => {
  let _sql = `SELECT * FROM article ORDER BY create_time DESC LIMIT 4;`
  return allServices.query(_sql)
}
// 获取文章分类
const getAllArticleCategory = () => {
  let _sql = `SELECT 
                t.id, 
                t.name, 
                COUNT(at.article_id) AS article_count
            FROM 
                tags t
            LEFT JOIN 
                article_tags at ON t.id = at.tag_id
            GROUP BY 
                t.id, 
                t.name
            ORDER BY 
                article_count DESC;`
  return allServices.query(_sql)
}
// 获取所有文章
const getAllArticleList = ({ page, size }) => {
  let _sql = `SELECT *
              FROM article
              ORDER BY create_time DESC, id DESC
              LIMIT ${size} OFFSET ${(page - 1) * size};`

  return allServices.query(_sql)
}
// 文章总数量
const getAllArticleCount = () => {
  let _sql = `SELECT COUNT(*) AS count FROM article;`
  return allServices.query(_sql)
}
// 每篇文章标签
const oneArticleTags = (id) => {
  let _sql = `
          SELECT 
            a.id AS article_id,
            GROUP_CONCAT(t.name SEPARATOR ', ') AS tag_names
          FROM 
              article a
          LEFT JOIN 
              article_tags at ON a.id = at.article_id
          LEFT JOIN 
              tags t ON at.tag_id = t.id
          GROUP BY 
              a.id;`

  return allServices.query(_sql)
}
// 根据id获取文章
const getArticleDetailById = (id) => {
  let _sql = `SELECT * FROM article WHERE id=${id};`
  return allServices.query(_sql)
}

// 登录
const userLogin = (username, password) => {
  let _sql = `SELECT * FROM users WHERE username='${username}' AND password='${password}';`
  return allServices.query(_sql)
}

// 注册（用户名不可重复，使用参数化查询防注入）
const userRegister = async (username, password, nickname) => {
  const checkSql = 'SELECT id FROM users WHERE username = ?'
  const exist = await allServices.query(checkSql, [username])
  if (exist.length) return Promise.reject(new Error('用户名已存在'))
  const create_time = Date.now()
  const displayName = nickname && nickname.trim() ? nickname.trim() : username
  const insertSql = 'INSERT INTO users (username, password, nickname, avatar, create_time) VALUES (?, ?, ?, ?, ?)'
  return allServices.query(insertSql, [username, password, displayName, '', create_time])
}

// 归档：返回所有文章的 id、title、create_time
const getArchiveList = () => {
  const _sql = `SELECT id, title, create_time FROM article ORDER BY create_time DESC, id DESC;`
  return allServices.query(_sql)
}

// 点赞
const addLike = async (article_id, user_id) => {
  // 往artcle_user表插入数据
  let _sql1 = `INSERT INTO article_user (user_id, article_id)
      SELECT ${user_id}, ${article_id}
      WHERE NOT EXISTS (
          SELECT 1 FROM article_user WHERE user_id=${user_id} AND article_id=${article_id}
      );`

  let _sql2 = `UPDATE article
    SET like_num = like_num + (SELECT CASE WHEN ROW_COUNT() > 0 THEN 1 ELSE 0 END)
    WHERE id=${article_id};`

  const res = await allServices.query(_sql1)
  if (res.affectedRows === 1) {
    return allServices.query(_sql2)
  }

  return Promise.resolve({ msg: '这篇文章您已赞过' })

  // return await Promise.all([allServices.query(_sql1), allServices.query(_sql2)])
}

// 评论
const addComment = (article_id, comment, user_id) => {
  const create_time = new Date().getTime().toString()
  let _sql = `INSERT INTO comment (create_time, article_id, comment_val, user_id) VALUES (${create_time}, ${article_id}, '${comment}', ${user_id});`
  return allServices.query(_sql)
}

// 获取文章评论
const getCommentList = (id) => {
  let _sql = `
      SELECT 
        c.id AS comment_id,
        c.comment_val AS comment_content,
        c.create_time AS comment_created_at,
        u.id AS user_id,
        u.username AS user_username,
        u.nickname AS user_nickname,
        u.avatar AS user_avatar
    FROM 
        comment c
    JOIN 
        users u ON c.user_id = u.id
    WHERE 
        c.article_id = ${id}
    ORDER BY 
        c.create_time DESC;`

  return allServices.query(_sql)
}

module.exports = {
  getNewsArticleList,
  getAllArticleCategory,
  getAllArticleList,
  getAllArticleCount,
  oneArticleTags,
  getArticleDetailById,
  userLogin,
  userRegister,
  getArchiveList,
  addLike,
  addComment,
  getCommentList
}