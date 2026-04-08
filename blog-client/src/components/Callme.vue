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
        <span><a href="https://github.com/codezzzzzzzz/" target="_blank">https://github.com/codezzzzzzzz/</a></span>
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
  background: var(--soft-surface-raised);
  border-radius: 0;
  border: 3px solid var(--px-ink);
  box-sizing: border-box;
  box-shadow: var(--nu-raised);

  .title {
    font-weight: 700;
    font-size: 18px;
    color: var(--soft-text);
    line-height: 28px;
    margin-bottom: 16px;
    font-family: var(--font-display);
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
        font-size: 18px;
        color: var(--soft-accent);
        margin-right: 12px;
      }

      span {
        font-weight: 500;
        font-size: 15px;
        color: var(--soft-text-muted);
        line-height: 24px;

        a {
          color: var(--soft-accent);
          cursor: pointer;
          transition: color var(--transition-soft);

          &:hover {
            color: var(--soft-accent-hover);
          }
        }
      }
    }
  }
}
</style>