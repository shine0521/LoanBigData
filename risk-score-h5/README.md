# 风险评分 H5 页面

移动端风险评分评估应用，基于 **Vue 3 + Vite + TypeScript + Vant 4 + Pinia + Vue Router + Axios + ECharts** 构建。

## 目录结构

```
risk-score-h5/
├── src/
│   ├── api/
│   │   └── risk.ts              # API 接口封装（submit / query-score / getAssessment）
│   ├── assets/styles/
│   │   ├── variables.scss       # 主题变量（颜色、间距、圆角等）
│   │   └── global.scss          # 全局样式
│   ├── components/
│   │   ├── FormField.vue        # 通用表单字段（输入框 + 清除 + 错误提示）
│   │   ├── ScoreGauge.vue       # ECharts 综合评分仪表盘（动画分数滚动）
│   │   ├── ScoreCard.vue        # 银行评分卡片（logo + 分数 + 趋势箭头）
│   │   ├── NavBar.vue           # 顶部导航栏
│   │   └── LoadingSpinner.vue   # 加载动画
│   ├── pages/
│   │   ├── InputPage.vue        # 信息输入页（/）
│   │   └── ResultPage.vue       # 评分结果页（/result）
│   ├── router/
│   │   └── index.ts             # Vue Router 路由配置
│   ├── stores/
│   │   └── risk.ts              # Pinia Store（表单 + 结果跨页传递）
│   ├── utils/
│   │   ├── validators.ts        # 表单校验（姓名/身份证/手机号 + 身份证校验码）
│   │   └── format.ts            # 格式化工具（脱敏/日期/风险颜色）
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── vite.config.ts               # Vite 配置（含 /api → localhost:3000 代理）
├── tsconfig.json
├── postcss.config.cjs            # postcss-pxtorem（375px → rem 适配）
└── README.md
```

## 快速启动

```bash
# 安装依赖
npm install

# 开发模式（http://localhost:5173）
npm run dev

# 构建生产包
npm run build

# 预览生产包
npm run preview
```

## API 代理说明

前端通过 Vite proxy 代理 `/api` 到 `http://localhost:3000`，**无需修改接口路径**，直接写相对路径即可：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/h5/submit` | 提交查询，返回 assessmentNo |
| POST | `/api/h5/query-score` | 查询评分（一体化提交+查询） |
| GET | `/api/h5/assessment/:no` | 根据评估编号拉取结果 |

> **后端需运行在 `http://localhost:3000`**，或修改 `vite.config.ts` 中的 `proxy.target`。

## 页面路由

| 路由 | 路径 | 说明 |
|------|------|------|
| index | `/` | 信息输入页（姓名 + 身份证 + 手机号） |
| result | `/result` | 评分结果页（仪表盘 + 银行卡片） |

## 功能亮点

- ✅ 实时表单校验（姓名 2-20 位中/英文、身份证 18 位 + 校验码、手机号 11 位）
- ✅ 身份证号自动转大写
- ✅ 字段右侧一键清除
- ✅ 隐私协议弹窗
- ✅ 提交按钮防重复点击（loading 状态）
- ✅ ECharts 仪表盘（分数 easeOutCubic 滚动动画）
- ✅ 风险等级颜色映射（低/中/高 → 绿/橙/红）
- ✅ 四大银行评分卡片（logo 占位 + 趋势箭头 ↑↓→）
- ✅ 移动端 375px → rem 自适应适配（postcss-pxtorem）
- ✅ Pinia Store 跨页传递表单和评分结果
- ✅ Axios 统一错误处理 + 防缓存时间戳

## 评分等级

| 分数范围 | 等级 | 颜色 |
|---------|------|------|
| 800-1000 | 低风险 | 🟢 #00C853 |
| 600-799 | 中风险 | 🟠 #FF9900 |
| 0-599 | 高风险 | 🔴 #FF3D00 |
