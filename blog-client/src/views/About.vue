<template>
  <div class="blog-about">
    <layoutLeftRight>
      <template v-slot:left>
        <div class="about-content__left">
          <div class="user-info">
            <div class="avatar">
              <img :src="DEFAULT_AVATAR_URL" alt="">
            </div>
            <div class="user-desc">
              <p class="name">阿炜</p>
              <p class="describle">全栈开发工程师，专注于 Web 开发和人工智能技术，热爱分享技术经验和学习心得。</p>
              <p class="tag">
                <span>前端开发</span>
                <span>人工智能</span>
                <span>Python</span>
              </p>
            </div>
          </div>
          <div class="about-card">
            <div class="title">关于本站</div>
            <p class="text">这是一个基于 Vue3 + Koa + MySQL 的技术博客，用于记录学习笔记与项目实践。欢迎在文章下留言交流。</p>
          </div>
        </div>
      </template>
      <template v-slot:right>
        <div class="about-model__right">
          <Category />
          <Callme class="mt32" />
        </div>
      </template>
    </layoutLeftRight>
  </div>
</template>

<script setup>
import layoutLeftRight from '@/components/layoutLeftRight.vue'
import Category from '@/components/Category.vue'
import Callme from '@/components/Callme.vue'
import { DEFAULT_AVATAR_URL } from '@/utils/mediaUrl.js'
</script>

<style lang="less" scoped>
.blog-about {
  .about-content__left {
    .user-info {
      padding: 26px;
      background: var(--soft-surface-raised);
      border-radius: 0;
      border: 3px solid var(--px-ink);
      display: flex;
      align-items: center;
      box-shadow: var(--nu-raised);

      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 0;
        border: 3px solid var(--px-ink);
        overflow: hidden;
        margin-right: 18px;
        box-shadow: var(--nu-raised-sm);

        img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          display: block;
        }
      }

      .user-desc {
        flex: 1;
        min-width: 0;

        .name {
          font-size: 20px;
          font-weight: 700;
          line-height: 28px;
          margin-bottom: 8px;
          color: var(--soft-text);
          font-family: var(--font-display);
        }

        .describle {
          font-weight: 500;
          font-size: 16px;
          color: var(--soft-text-muted);
          line-height: 24px;
          margin-bottom: 12px;
        }

        .tag span {
          font-size: 13px;
          color: var(--soft-text-muted);
          line-height: 20px;
          padding: 6px 14px;
          background: var(--soft-surface);
          border-radius: var(--soft-radius-pill);
          border: 2px solid var(--px-ink);
          margin-right: 8px;
          display: inline-block;
          box-shadow: 2px 2px 0 var(--px-ink);
          font-weight: 700;
        }
      }
    }

    .about-card {
      margin-top: 32px;
      padding: 26px;
      background: var(--soft-surface-raised);
      border-radius: 0;
      border: 3px solid var(--px-ink);
      box-shadow: var(--nu-raised);

      .title {
        font-size: 20px;
        font-weight: 700;
        color: var(--soft-text);
        line-height: 28px;
        margin-bottom: 16px;
        font-family: var(--font-display);
      }

      .text {
        font-size: 16px;
        color: var(--soft-text-muted);
        line-height: 24px;
        font-weight: 500;
      }
    }
  }

}
</style>
