<template>
  <div class="blog-about">
    <layoutLeftRight>
      <template v-slot:left>
        <div class="about-content__left">
          <div class="user-info">
            <div class="avatar">
              <img src="@/assets/avatar.png" alt="">
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
</script>

<style lang="less" scoped>
.blog-about {
  .about-content__left {
    .user-info {
      padding: 24px;
      background-color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;

      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 16px;

        img {
          height: 100%;
        }
      }

      .user-desc {
        .name {
          font-size: 20px;
          font-weight: 600;
          line-height: 28px;
          margin-bottom: 8px;
        }

        .describle {
          font-weight: 400;
          font-size: 16px;
          color: #4B5563;
          line-height: 24px;
          margin-bottom: 12px;
        }

        .tag span {
          font-size: 14px;
          color: #4B5563;
          line-height: 20px;
          padding: 4px 12px;
          background-color: #F3F4F6;
          border-radius: 100px;
          margin-right: 8px;
          display: inline-block;
        }
      }
    }

    .about-card {
      margin-top: 32px;
      padding: 24px;
      background-color: #fff;
      border-radius: 8px;

      .title {
        font-size: 20px;
        font-weight: 600;
        color: #000;
        line-height: 28px;
        margin-bottom: 16px;
      }

      .text {
        font-size: 16px;
        color: #4B5563;
        line-height: 24px;
      }
    }
  }

  @media screen and (max-width: 1200px) {
    .about-model__right {
      display: none;
    }
  }
}
</style>
