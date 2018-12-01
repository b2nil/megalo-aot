<template>
  <div class="app">
    <img
      class="img"
      src="https://user-images.githubusercontent.com/20720117/48007061-c516b380-e151-11e8-8dd0-cd1b0aaaef5f.png"
      @touchstart="changeStat"
    >
    <hello-world :color="color">
      <h1
        class="txt"
        slot="title"
        v-show="t%2==1"
      >click logo::{{t}}</h1>
      <a
        class="nav"
        url="/pages/packageB/pages/test/index"
      >跳转至分包 B</a>
      <a
        class="nav"
        slot="footer"
        url="/pages/hello/hello"
      >返回首页</a>
    </hello-world>

  </div>
</template>

<script>
import HelloWorld from "@/components/HelloWorld.vue";
export default {
  mpType: "page",
  components: {
    HelloWorld
  },
  data() {
    return {
      t: 1,
      color: "#007d37"
    };
  },
  created() {
    wx.setNavigationBarTitle({
      title: "分包 A"
    });
  },
  methods: {
    changeStat: function() {
      this.t++;
      this.color = "#" + Math.floor(Math.random() * 0xffffff).toString(16);
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/style/nav.less";
.img {
  display: block;
  height: 120px;
  width: 120px;
  margin: 20px auto;
}
.txt {
  color: #567567;
  font-size: 13px;
  text-align: center;
}
</style>
