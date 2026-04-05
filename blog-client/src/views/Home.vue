<template>
  <div class="blog-home">
    <layoutLeftRight>
      <template v-slot:left>
        <div class="home-content__left">
          <div class="user-info">
            <div class="avatar">
              <img src="@/assets/avatar.png" alt="">
            </div>
            <div class="user-desc">
              <p class="name"> 阿炜 </p>
              <p class="describle">全栈开发工程师，专注于Web开发和人工智能技术，热爱分享技术经验和学习心得。</p>
              <p class="tag">
                <span>前端开发</span>
                <span>人工智能</span>
                <span>Python</span>
              </p>
            </div>
          </div>
          <div class="news-article">
            <div class="title">最新文章</div>
            <div class="article-list">
              <div class="article-item" v-for="item in newsArticleList" :key="item.id">
                <div class="article-pic">
                  <img :src="item.cover_pic" alt="">
                </div>
                <div class="article-desc">
                  <div class="name">{{ item.title }}</div>
                  <div class="introduce">{{ item.article_desc }}</div>
                  <div class="time">
                    <span>{{ formateDate(item.create_time) }}</span>
                    <router-link :to="{ path: '/detail', query: { id: item.id } }">阅读更多</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:right>
        <div class="home-model__right">
          <Category />
          <Callme class="mt32" />
        </div>
      </template>
    </layoutLeftRight>
  </div>
</template>

<script setup>
import layoutLeftRight from '@/components/layoutLeftRight.vue';
import Category from '@/components/Category.vue';
import Callme from '@/components/Callme.vue';
import { getNewsArticleList } from '@/api/index.js';
import { onMounted, ref } from 'vue';
import { formateDate } from '@/utils/formateDate.js';

const newsArticleList = ref([])

onMounted(async () => {
  const res = await getNewsArticleList()
  console.log(res);
  newsArticleList.value = res.data
})

</script>

<style lang="less" scoped>
.blog-home {
  .home-content__left {
    .user-info {
      padding: 24px;
      background-color: #FFFFFF;
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

        .tag {
          span {
            font-weight: 400;
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
    }

    .news-article {
      margin-top: 32px;

      .title {
        font-weight: 600;
        font-size: 20px;
        color: #000000;
        line-height: 28px;
        margin-bottom: 24px;
      }

      .article-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;

        .article-item {
          border-radius: 8px;
          overflow: hidden;

          .article-pic {
            width: 100%;
            height: 192px;
            overflow: hidden;

            img {
              height: 100%;
              width: 100%;
            }
          }

          .article-desc {
            padding: 24px;
            background-color: #fff;

            .name {
              font-weight: 600;
              font-size: 18px;
              color: #000000;
              line-height: 28px;
              margin-bottom: 8px;
            }

            .introduce {
              font-weight: 400;
              font-size: 14px;
              color: #4B5563;
              line-height: 20px;
              margin-bottom: 16px;
            }

            .time {
              font-weight: 400;
              font-size: 14px;
              color: #6B7280;
              line-height: 20px;
              display: flex;
              justify-content: space-between;

              a {
                color: #8E6FF7;
              }
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: 1200px) {
    .home-model__right {
      display: none;
    }
  }
}
</style>