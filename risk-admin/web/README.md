# 风险评分管理平台 - PC 后台前端

> Vue 3 + Vite + TypeScript + Element Plus + Pinia + Vue Router + Axios + ECharts

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4 | 渐进式前端框架 |
| Vite | ^5.0 | 构建工具 |
| TypeScript | ^5.3 | 类型安全 |
| Element Plus | ^2.5 | PC UI 组件库 |
| Pinia | ^2.1 | 状态管理 |
| Vue Router | ^4.2 | 路由管理 |
| Axios | ^1.6 | HTTP 客户端 |
| ECharts | ^5.4 | 数据可视化 |
| socket.io-client | ^4.7 | WebSocket 实时通信 |

## 项目结构

```
src/
├── api/                     # API 接口封装
│   ├── modules/             # 分模块 API
│   │   ├── login.ts         # 登录
│   │   ├── customer.ts      # 客户管理
│   │   ├── profile.ts       # 资料记录
│   │   ├── assessment.ts    # 评分记录
│   │   ├── dashboard.ts     # 工作台
│   │   └── system.ts        # 系统管理
│   └── risk.ts              # Axios 封装（JWT 拦截器）
├── assets/styles/           # 全局样式
├── components/              # 可复用组件
│   ├── MaskText.vue         # 脱敏文本展示
│   ├── RiskTag.vue          # 风险等级彩色标签
│   └── TableToolbar.vue     # 表格工具栏
├── hooks/                   # Composition API Hooks
│   └── useWebSocket.ts      # WebSocket（socket.io）实时推送
├── layout/                  # 布局组件
│   └── AdminLayout.vue      # 左侧菜单 + 顶部栏布局
├── router/                  # 路由
│   └── index.ts             # 路由表 + 登录守卫
├── stores/                  # Pinia 状态管理
│   ├── user.ts              # Token + 用户信息
│   └── notify.ts            # 未读消息角标
├── types/                   # TypeScript 类型定义
│   └── index.ts             # 全量类型（与后端字段一致）
├── utils/                   # 工具函数
│   └── format.ts            # 脱敏、日期格式化
└── views/                   # 页面组件
    ├── login/Login.vue      # 登录页
    ├── dashboard/Dashboard.vue  # 工作台
    ├── customer/CustomerList.vue # 用户管理
    ├── profile/ProfileList.vue   # 用户信息记录
    ├── assessment/AssessmentList.vue # 评分记录
    └── system/              # 系统管理
        ├── AdminUser.vue    # 管理员账号
        └── OperationLog.vue # 操作日志
```

## 快速启动

```bash
# 安装依赖
npm install

# 开发模式（开发服务器：http://localhost:5173）
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 默认登录账号

| 字段 | 值 |
|------|-----|
| 账号 | `admin` |
| 密码 | `123456` |
| 验证码 | 页面显示（占位，点击可刷新）|

## API 代理配置

Vite 已配置代理，后端运行在 `http://localhost:3000`：

- `/api` → `http://localhost:3000/api`
- `/socket.io` → `http://localhost:3000/socket.io`（WebSocket）

## 字段命名规范（与 H5 后端保持一致）

| 字段 | 说明 |
|------|------|
| `name` | 姓名 |
| `idCard` | 身份证号 |
| `phone` | 手机号 |
| `score_type` | `comprehensive` \| `boc` \| `icbc` \| `abc` \| `ccb` |
| `risk_level` | `1`=低风险 / `2`=中风险 / `3`=高风险 |
| `comprehensive_score` | 综合评分（0-1000）|

## 主要功能

- **登录**：账号 + 密码 + 图形验证码，JWT Token 鉴权
- **工作台**：统计卡片 + ECharts 饼图（风险分布）+ 柱状图（各行均分）
- **用户信息记录**：H5 提交记录列表，多条件筛选，实时 WebSocket 推送
- **用户信息管理**：CRUD + 批量导入 + 脱敏展示
- **评分记录**：综合分 + 中/工/农/建四行分，详情抽屉，评分修正，重算
- **管理员账号**：账号 CRUD + 角色管理
- **操作日志**：完整操作审计链

## WebSocket 实时同步

- 连接地址：`http://localhost:3000/ws/admin/notify`
- 监听事件：`h5.submit.new`（H5 新提交时推送）
- 收到推送后：页面顶部显示提示 + 列表自动刷新
- 断线自动重连

## 注意事项

- 身份证号、姓名、手机号在列表页自动脱敏展示
- 未登录访问自动跳转 `/login`
- 导入/导出功能为占位实现
- ECharts 组件按需引入，无单独路由不引入（减少主包体积）
