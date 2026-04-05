<template>
  <div class="article_detail">
    <div class="detail">
      <div class="title">{{ articleDetail.title }}</div>
      <div class="user">
        <div class="avatar">
          <img src="@/assets/avatar.png" alt="">
        </div>
        <div class="atuhor after">作者：{{ articleDetail.author }}</div>
        <div class="time after">发布于：{{ formateDate(articleDetail.create_time) }}</div>
        <div class="read">阅读：{{ articleDetail.read }}</div>
      </div>
      <article>
        <div class="banner">
          <img :src="articleDetail.article_cover_pic" alt="">
        </div>
        <div class="article-content" v-html="articleDetail.content"></div>
      </article>

      <div class="share">
        <div class="left">
          <div class="share-item" :style="{ background: randomColor(50, 150) }">
            <i class="iconfont icon-weixin"></i>
          </div>
          <div class="share-item" :style="{ background: randomColor(50, 150) }">
            <i class="iconfont icon-QQ"></i>
          </div>
        </div>
        <div class="right">
          <el-button color="#8E6FF7" class="btn" @click="addLike">
            <i class="iconfont icon-dianzan"></i>
            点赞文章
          </el-button>
        </div>
      </div>
    </div>
    <div class="comment">
      <div class="title">评论</div>
      <div class="comment-input">
        <textarea v-model="comment" placeholder="写下你的评论..."></textarea>
      </div>
      <el-button color="#8E6FF7" class="btn" @click="publish">发表评论</el-button>
      <div class="comment-list">
        <ul>
          <li class="list-item" v-for="item in commentList" :key="item.comment_id">
            <div class="avatar">
              <img :src="item.user_avatar ? item.user_avatar : baseImg" alt="">
            </div>
            <div class="comment-content">
              <div class="comment-user">{{item.user_nickname}}</div>
              <div class="comment-text">
                {{item.comment_content}}
              </div>
              <div class="comment-time">{{formateDate(item.comment_created_at, true)}}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleDetailById, addLikeApi, addCommentApi, getCommentList } from '@/api/index.js'
import { formateDate } from '@/utils/formateDate.js'
import { randomColor } from '@/utils/randomColor.js'
import { isLogin } from '@/utils/isLogin.js'
import baseImg from '@/assets/vue.svg'

const route = useRoute()
// console.log(route.query.id);
const articleDetail = ref({})
const comment = ref('')
const commentList = ref([])

onMounted(async () => {
  const res = await getArticleDetailById(route.query.id)
  articleDetail.value = res.data

  // 加载评论
  const commentRes = await getCommentList(route.query.id)
  console.log(commentRes);
  commentList.value = commentRes.data
})

const addLike = async () => {
  // 点赞, 向后端发送一个请求, 把文章的id传过去，用户的id也传过去
  // 登录问题
  if (isLogin()) { // 登录了
    const res = await addLikeApi({ article_id: route.query.id })
    ElMessage({
      message: res.msg,
      type: res.data === 'success' ? 'success' : 'warning',
    })
  } else {
    ElMessage({
      message: '点赞功能需要先登录哦',
      type: 'warning',
    })
  }
}

// 发表评论
const publish = async() => {
  if (comment.value === '') {
    ElMessage({
      message: '评论内容不能为空',
      type: 'error',
    })
    return  
  }

  if (isLogin()) {
    const res = await addCommentApi({
      article_id: route.query.id,
      comment: comment.value
    })
    if (res.data === 'success') {
      ElMessage({
        message: '评论成功',
        type: 'success',
      })
      comment.value = ''
    } else {
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
    
  } else {
    ElMessage({
      message: '评论功能需要先登录哦',
      type: 'warning',
    })
  }
}
</script>

<style lang="less" scoped>
.article_detail {
  width: 100%;
  background-color: #F9FAFB;
  min-height: calc(100vh - 140px);
  padding: 32px 0;
  box-sizing: border-box;

  .detail {
    width: 60%;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 16px;
    padding: 32px 24px;
    box-sizing: border-box;

    .title {
      font-family: Roboto, Roboto;
      font-weight: 700;
      font-size: 30px;
      color: #111827;
      line-height: 36px;
      margin-bottom: 16px;
    }

    .user {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 14px;
      color: #6B7280;
      line-height: 20px;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 12px;

        img {
          width: 100%;
        }
      }

      .after {
        margin-right: 8px;
        padding-right: 8px;
        position: relative;

        &::after {
          content: '';
          width: 1px;
          height: 12px;
          background-color: #6B7280;
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }

    article {
      padding: 32px 0 56px 0;

      .banner {
        width: 100%;
        height: 256px;
        margin-bottom: 32px;
        overflow: hidden;
        border-radius: 16px;

        img {
          width: 100%;
        }
      }
    }

    .share {
      width: 100%;
      height: 68px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        display: flex;

        .share-item {
          margin-right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          // background-color: #6B7280;
          text-align: center;
          line-height: 32px;

          .iconfont {
            font-size: 20px;
            color: #fff;
          }
        }
      }

      .right {
        .btn {
          color: #fff;
        }
      }
    }
  }

  .comment {
    width: 60%;
    margin: 0 auto;
    margin-top: 48px;

    .title {
      font-weight: 700;
      font-size: 24px;
      color: #111827;
      line-height: 32px;
      margin-bottom: 24px;
    }

    .comment-input {
      width: 100%;
      height: 114px;
      border-radius: 16px;
      border: 1px solid #E5E7EB;
      overflow: hidden;
      margin-bottom: 15px;

      textarea {
        border: none;
        width: 100%;
        height: 100%;
        padding: 10px;
        box-sizing: border-box;
        outline: none;
      }
    }

    .btn {
      color: #fff;
    }

    .comment-list {
      margin-top: 32px;

      .list-item {
        display: flex;
        margin-bottom: 24px;

        .avatar {
          flex: 0 0 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 12px;

          img {
            width: 100%;
          }
        }

        .comment-content {
          flex: 1;

          .comment-user {
            font-weight: 500;
            font-size: 14px;
            color: #111827;
            line-height: 20px;
            margin-bottom: 4px;
          }

          .comment-text {
            font-weight: 400;
            font-size: 14px;
            color: #4B5563;
            line-height: 20px;
            margin-bottom: 8px;
          }

          .comment-time {
            font-weight: 400;
            font-size: 12px;
            color: #6B7280;
            line-height: 16px;
          }
        }
      }
    }
  }
}
</style>