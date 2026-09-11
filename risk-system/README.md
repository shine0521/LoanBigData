# 风险评分系统 — 总览与部署

配套工程：H5 用户端风险评分 + PC 后台管理 + NestJS 后端。

```
.
├── risk-score-h5/          # H5 移动端（Vue3 + Vite + Vant + ECharts）
├── risk-admin/
│   ├── server/             # 后端 API（NestJS + TypeORM + MySQL + WebSocket）
│   └── web/                # PC 后台管理（Vue3 + Vite + Element Plus + ECharts）
└── risk-system/            # 本目录：基础设施编排（docker-compose / nginx）
```

## 一、目录说明

| 目录 | 技术栈 | 端口 | 说明 |
|------|--------|------|------|
| `risk-score-h5` | Vue 3 + Vant 4 | 5173 | 用户填写信息 + 查看评分 |
| `risk-admin/server` | NestJS + TypeORM | 3000 | 统一 API + 实时同步 |
| `risk-admin/web` | Vue 3 + Element Plus | 5174 | 后台管理（用户/评分/同步） |

## 二、快速启动（开发模式）

### 1. 启动基础设施（MySQL + Redis）
```bash
cd risk-system
docker compose up -d
```
- MySQL: 3306 / 账号 root / 密码 risk123456 / 库 risk_score
- Redis: 6379
- 建表：把 `risk-admin/server/db-schema.sql` 放到 `risk-system/init/` 下会自动执行；或手动导入

### 2. 启动后端
```bash
cd risk-admin/server
cp .env.example .env        # 已含默认配置
npm install
npm run start:dev
```

### 3. 启动 H5 前端
```bash
cd risk-score-h5
npm install
npm run dev                 # http://localhost:5173
```

### 4. 启动 PC 后台
```bash
cd risk-admin/web
npm install
npm run dev                 # http://localhost:5174
```
- 后台登录账号：`admin / 123456`

## 三、API 契约（三方统一）

**H5 公开接口**
- `POST /api/h5/submit`          `{name, idCard, phone}` → 保存并返回 assessmentNo
- `POST /api/h5/query-score`     `{name, idCard, phone}` | `{assessmentNo}` → 评分
- `GET  /api/h5/assessment/:no`  详情

**后台管理接口（需 JWT）**
- `POST /api/admin/login`
- `GET/POST/PUT/DELETE /api/admin/customers[/:id]`、批量导入 `/import`
- `GET /api/admin/profiles`
- `GET /api/admin/assessments`、详情 `/:id`、重算 `/:id/recalc`
- `PUT /api/admin/scores/:id`（人工修正）
- `GET /api/admin/dashboard`

**WebSocket 实时同步**
- 命名空间 `/ws/admin/notify`（socket.io），事件 `h5.submit.new`

## 四、生产部署

```bash
# 分别 build 三个工程
cd risk-admin/server && npm run build
cd risk-score-h5   && npm run build
cd risk-admin/web   && npm run build

# 用 risk-system/nginx.conf 作为统一入口（按注释修改 root 路径与 server_name）
```

## 五、统一响应格式
```json
{ "code": 0, "message": "success", "data": { } }
```
