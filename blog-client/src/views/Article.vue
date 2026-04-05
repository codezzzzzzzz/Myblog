<template>
  <div class="article">
    <div class="title">最新文章</div>
    <LayoutLeftRight>
      <template v-slot:left>
        <div class="arcitle-card" @click="goDetail(item.id)" v-for="item in articleList" :key="item.id">
          <div class="name">{{ item.title }}</div>
          <div class="desc">
            {{ item.article_desc }}
          </div>
          <div class="control">
            <div class="control-left">
              <div class="item">
                <i class="iconfont icon-rili"></i>
                <span>{{ formateDate(item.create_time) }}</span>
              </div>
              <div class="item">
                <i class="iconfont icon-yueduliang"></i>
                <span>{{ item.read }}阅读 </span>
              </div>
              <div class="item">
                <i class="iconfont icon-dianzan"></i>
                <span>{{ item.like_num }}点赞</span>
              </div>
            </div>
            <div class="control-right">
              <div 
                v-if="item.tag_names"
                class="tag" 
                v-for="tag in item.tag_names.split(', ')"  
                :style="{ background: randomColor(150, 250), color: randomColor(0, 100) }"
              >
                {{tag}}
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:right>
        <Category />
        <Callme class="mt32" />
      </template>

    </LayoutLeftRight>
  </div>
</template>

<script setup>
import LayoutLeftRight from '@/components/layoutLeftRight.vue'
import Category from '@/components/Category.vue';
import Callme from '@/components/Callme.vue';
import { randomColor } from '@/utils/randomColor.js'
import { getAllArticleList } from '@/api/index.js'
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { formateDate } from '@/utils/formateDate.js'

const articleList = ref([])
const totalPage = ref(0)
const page = ref(1)
const size = 5

const getData = async () => {
  const res = await getAllArticleList({ page: page.value, size: size })
  console.log(res);
  articleList.value = [...articleList.value, ...res.data]
  totalPage.value = res.totalPage
}

// 获取文章列表
onMounted(async () => {
  getData()
})

// 下一页
// 监听滚动事件，判断是否滚动到底部
window.addEventListener('scroll', function () {
  // 获取视口高度
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  // 获取文档总高度
  const docHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
  // 获取当前滚动位置
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

  // 判断是否触底
  if (scrollPosition + windowHeight >= docHeight) {
    // console.log('滚动到底部');
    // 在这里可以执行加载更多数据等操作
    getNextPage()
  }
})


const getNextPage = () => {
  if (page.value >= totalPage.value) { // 已经是最后一页了
    return
  }
  page.value++
  getData()
}

const router = useRouter()
const goDetail = (id) => {
  router.push({path: '/detail', query: { id: id }})
}

</script>

<style lang="less" scoped>
.article {
  background-color: #F9FAFB;

  .title {
    font-weight: 700;
    font-size: 36px;
    color: #1F2937;
    line-height: 40px;
    padding: 32px 104px 0 104px;
  }

  .arcitle-card {
    width: 100%;
    background-color: #fff;
    padding: 24px;
    box-sizing: border-box;
    border-radius: 16px;
    box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1);
    margin-bottom: 32px;
    cursor: pointer;
    &:hover{
      box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.2), 0px 2px 4px -2px rgba(0, 0, 0, 0.2);
    }

    .name {
      font-weight: 700;
      font-size: 30px;
      color: #1F2937;
      line-height: 36px;
      margin-bottom: 16px;
    }

    .desc {
      font-weight: 400;
      font-size: 18px;
      color: #4B5563;
      line-height: 28px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 24px;
    }

    .control {
      display: flex;
      justify-content: space-between;

      .control-left {
        display: flex;
        color: #6B7280;
        font-weight: 400;
        font-size: 14px;
        align-items: center;

        .item {
          margin-right: 16px;

          .iconfont {
            color: #8E6FF7;
            margin-right: 5px;
          }
        }
      }

      .control-right {
        display: flex;
        align-items: center;

        .tag {
          padding: 4px 12px;
          border-radius: 100px;
          background-color: #6B7280;
          font-weight: 400;
          font-size: 14px;
          margin-left: 8px;
        }
      }
    }
  }
}
</style>