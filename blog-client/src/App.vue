<template>
  <div>
    <Head v-if="isShow"/>
    <router-view></router-view>
    <Foot v-if="isShow"/>
  </div>
</template>

<script setup>
import Head from '@/components/Head.vue';
import Foot from '@/components/Foot.vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const isShow = ref(true);
const router = useRouter();
// 某些页面是不需要 head
const whiteList = ['/login', '/register', '/forget-password'];
router.beforeEach((to, from, next) => {
  if (whiteList.includes(to.path)) {
    isShow.value = false;
    next()
  } else {
    isShow.value = true;
    next()
  }

})
</script>

<style lang="scss" scoped>

</style>