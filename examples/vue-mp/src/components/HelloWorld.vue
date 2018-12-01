<template>
  <div class="hello">
    <h1 :style="'color:'+color">{{ msg }}</h1>
    <slot name='title'> 默认标题</slot>
    <slot>默认内容</slot>
    <slot name='footer'>默认页脚</slot>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: ["color"],
  data() {
    return {
      msg: "Welcome to Megalo"
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello {
  font-size: 16px;
  text-align: center;
}
</style>
