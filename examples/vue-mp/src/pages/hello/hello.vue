<template>
  <div class="app">
    <img
      class="img"
      :src="logo"
      @touchstart="changeStat"
    >
    <hello-world :color="color">
      <h1
        class="txt"
        v-show="t%2==1"
        slot="title"
      >click logo::{{t}}</h1>
      <a
        class="nav"
        url="/packageA/pages/test/index"
      >跳转至分包 A</a>
      <a
        class="nav"
        slot="footer"
        url="/pages/packageB/pages/test/index"
      >跳转至分包 B</a>

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
      logo:
        "https://user-images.githubusercontent.com/20720117/48262986-80e02780-e45f-11e8-8426-2872916adad9.png",
      t: 1,
      color: "#007d37"
    };
  },
  created() {
    console.log("Page Vue created");
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
