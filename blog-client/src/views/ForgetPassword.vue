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
  min-height: 100vh;
  background: var(--soft-bg);
  background-image: linear-gradient(165deg, var(--soft-bg-top) 0%, var(--soft-bg) 50%, #dfe5ef 100%);
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
      border-radius: 0;
      padding: 4px 8px;
      border: 3px solid var(--px-ink);
      box-shadow: var(--nu-raised-sm);
      background: var(--soft-read);

      img {
        width: 100%;
        display: block;
        border-radius: 0;
      }
    }
  }

  .forget-wrap {
    width: min(448px, calc(100vw - 40px));
    background: var(--soft-surface-raised);
    box-shadow: var(--nu-raised);
    border-radius: 0;
    border: 3px solid var(--px-ink);
    padding: 36px 32px;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;

    .title {
      font-weight: 700;
      font-size: 24px;
      color: var(--soft-text);
      margin-bottom: 8px;
      font-family: var(--font-display);
    }

    .desc {
      font-size: 16px;
      color: var(--soft-text-muted);
      margin-bottom: 24px;
      font-weight: 500;
    }

    .back {
      color: var(--soft-accent);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: color var(--transition-soft);
      &:hover {
        color: var(--soft-accent-hover);
      }
    }
  }

  .forget-ft {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 72px;
    line-height: 72px;
    text-align: center;
    font-size: 15px;
    color: var(--soft-text-muted);
    font-weight: 500;
  }
}
</style>
