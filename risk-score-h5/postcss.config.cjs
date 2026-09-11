// postcss px → rem/vw 适配配置
// 设计稿基准 375px，使用 postcss-pxtorem 将 px 自动转为 rem
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5,         // 375px 基准，1rem = 37.5px
      unitPrecision: 5,        // 转换精度
      propList: ['*'],         // 所有属性均转换
      selectorBlackList: [],   // 不转换的选择器列表（空 = 全部转换）
      replace: true,
      mediaQuery: false,
      minPixelValue: 2,        // 小于 2px 不转换
    },
  },
}
