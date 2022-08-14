const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  publicPath:
    process.env.NODE_ENV === "production" ? "/stock-treemap-by-echarts/" : "/",
  transpileDependencies: true,
  lintOnSave: false, //关闭eslint检查
});
