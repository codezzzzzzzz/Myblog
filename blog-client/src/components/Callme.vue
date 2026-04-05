<template>
  <div class="call-me">
    <div class="title">联系我</div>
    <ul>
      <li>
        <i class="iconfont icon-email-fill"></i>
        <span>15717953174@qq.com</span>
      </li>
      <li>
        <i class="iconfont icon-github-fill"></i>
        <span><a href="https://gitee.com/snail_wn" target="_blank">https://github.com/codezzzzzzzz/</a></span>
      </li>
      <li>
        <i class="iconfont icon-weixin"></i>
        <span>15717953174</span>
      </li>
    </ul>
  </div>
</template>

<script setup>

</script>

<style lang="less" scoped>
.call-me {
  width: 100%;
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-sizing: border-box;

  .title {
    font-weight: 600;
    font-size: 18px;
    color: #000000;
    line-height: 28px;
    margin-bottom: 16px;
  }

  ul {
    li {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .iconfont {
        font-size: 16px;
        color: #8E6FF7;
        margin-right: 10px;
      }

      span {
        font-weight: 400;
        font-size: 16px;
        color: #4B5563;
        line-height: 24px;

        a {
          color: #4B5563;
        }
      }
    }
  }
}
</style>