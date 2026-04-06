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
    bio VARCHAR(500) NOT NULL DEFAULT '' COMMENT '个人签名',
    create_time BIGINT
);

-- 文章表
CREATE TABLE IF NOT EXISTS article (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    create_time BIGINT,
    like_num INT DEFAULT 0,
    user_id INT NOT NULL,
    cover_pic VARCHAR(255),
    article_desc VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users (id)
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
        avatar,
        bio,
        create_time
    )
VALUES (
        'admin',
        'e10adc3949ba59abbe56e057f20f883e',
        '管理员',
        '',
        '',
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
        like_num,
        user_id,
        cover_pic,
        article_desc
    )
VALUES (
        '欢迎使用本博客',
        '这是第一篇测试文章。',
        UNIX_TIMESTAMP() * 1000,
        0,
        1,
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blog%20cover%20image%20minimalist&image_size=square',
        '欢迎来到我的个人博客，这里记录我的技术分享和生活感悟。'
    ),
    (
        '第二篇文章',
        '再写一篇试试。',
        UNIX_TIMESTAMP() * 1000,
        0,
        1,
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20technology%20blog&image_size=square',
        '这是我的第二篇测试文章，测试文章编辑功能。'
    );

-- 关联文章和标签（根据上面插入的 id，article 1 对应 tag 1,2；article 2 对应 tag 2,3）
INSERT INTO
    article_tags (article_id, tag_id)
VALUES (1, 1),
    (1, 2),
    (2, 2),
    (2, 3);