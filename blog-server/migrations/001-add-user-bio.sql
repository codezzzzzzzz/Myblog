-- 已有库升级：为用户表增加「签名」字段
-- 适用：在旧版 init-db（无 bio 列）上已跑过建表的数据库。
-- 全新安装请直接执行仓库根目录的 init-db.sql，无需再执行本文件。
-- 执行示例（在 blog-server 目录下）：
--   mysql -u root -p blog < migrations/001-add-user-bio.sql

USE blog;

ALTER TABLE users
ADD COLUMN bio VARCHAR(500) NOT NULL DEFAULT '' COMMENT '个人签名' AFTER avatar;
