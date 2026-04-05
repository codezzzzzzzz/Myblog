-- 博客数据库初始化脚本
-- 在 MySQL 中执行此文件：mysql -u root -p < init-db.sql 或用 Navicat 等工具执行

CREATE DATABASE IF NOT EXISTS blog DEFAULT CHARACTER SET utf8mb4;

USE blog;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    create_time BIGINT
);

-- 文章表
CREATE TABLE IF NOT EXISTS article (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    create_time BIGINT,
    like_num INT DEFAULT 0
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- 文章-标签关联表
CREATE TABLE IF NOT EXISTS article_tags (
    article_id INT,
    tag_id INT,
    PRIMARY KEY (article_id, tag_id)
);

-- 评论表
CREATE TABLE IF NOT EXISTS comment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    create_time BIGINT,
    article_id INT,
    comment_val TEXT,
    user_id INT
);

-- 用户点赞文章表
CREATE TABLE IF NOT EXISTS article_user (
    user_id INT,
    article_id INT,
    PRIMARY KEY (user_id, article_id)
);

-- 插入测试用户（前端登录会用 md5 加密后传参，这里存 md5('123456')）
INSERT INTO
    users (
        username,
        password,
        nickname,
        create_time
    )
VALUES (
        'admin',
        'e10adc3949ba59abbe56e057f20f883e',
        '管理员',
        UNIX_TIMESTAMP() * 1000
    );

-- 插入测试标签
INSERT INTO tags (name) VALUES ('前端'), ('后端'), ('随笔');

-- 插入测试文章（create_time 为毫秒时间戳）
INSERT INTO
    article (
        title,
        content,
        create_time,
        like_num
    )
VALUES (
        '欢迎使用本博客',
        '这是第一篇测试文章。',
        UNIX_TIMESTAMP() * 1000,
        0
    ),
    (
        '第二篇文章',
        '再写一篇试试。',
        UNIX_TIMESTAMP() * 1000,
        0
    );

-- 关联文章和标签（根据上面插入的 id，article 1 对应 tag 1,2；article 2 对应 tag 2,3）
INSERT INTO
    article_tags (article_id, tag_id)
VALUES (1, 1),
    (1, 2),
    (2, 2),
    (2, 3);