<template>
  <div class="forget">
    <div class="forget-hd">
      <div class="forget-logo">
        <img src="@/assets/logo.jpg" alt="">
      </div>
    </div>
    <div class="forget-wrap">
      <div class="title">找回密码</div>
      <div class="desc">该功能开发中，如有问题请联系站长。</div>
      <router-link to="/login" class="back">返回登录</router-link>
    </div>
    <div class="forget-ft">© 2024 技术博客. 保留所有权利</div>
  </div>
</template>

<script setup>
</script>

<style lang="less" scoped>
.forget {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(145deg, #FAF5FF 0%, #FFFFFF 100%);
  position: relative;

  .forget-hd {
    width: 100%;
    height: 88px;
    display: flex;
    align-items: center;
    padding: 0 30px;
    box-sizing: border-box;

    .forget-logo {
      width: 150px;
      height: 40px;

      img {
        width: 100%;
      }
    }
  }

  .forget-wrap {
    width: 448px;
    background: #fff;
    box-shadow: 0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    padding: 32px;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;

    .title {
      font-weight: 700;
      font-size: 24px;
      color: #1F2937;
      margin-bottom: 8px;
    }

    .desc {
      font-size: 16px;
      color: #4B5563;
      margin-bottom: 24px;
    }

    .back {
      color: #71377E;
      font-size: 16px;
    }
  }

  .forget-ft {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 72px;
    line-height: 72px;
    text-align: center;
    font-size: 16px;
    color: #4B5563;
  }
}
</style>
