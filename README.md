# LoanBigData

银行风险评分大数据查询与后台管理系统。包含 **H5 移动端**、**PC 后台管理**、**NestJS 后端 API + WebSocket** 一整套可独立部署的代码。

## 仓库结构

```
LoanBigData/
├── risk-system/                # 基础设施编排（docker-compose / nginx）
├── risk-score-h5/              # H5 移动端（Vue 3 + Vant 4 + ECharts）
└── risk-admin/
    ├── server/                 # 后端 API（NestJS + TypeORM + WebSocket）
    └── web/                    # PC 后台管理（Vue 3 + Element Plus + ECharts）
```

| 子项目 | 技术栈 | 端口 | 用途 |
|--------|--------|------|------|
| `risk-score-h5` | Vue 3 · Vite · Vant 4 · ECharts | 5173 | 用户填写信息 + 查看综合评分/银行评分 |
| `risk-admin/server` | NestJS · TypeORM · MySQL/SQLite · Socket.IO | 3000 | 统一 API + 实时同步推送 |
| `risk-admin/web` | Vue 3 · Vite · Element Plus · ECharts | 5174 | 后台管理（客户/评估/同步/仪表盘） |
| `risk-system` | docker-compose · nginx | — | MySQL/Redis 容器 + 生产 Nginx 反代配置 |

## 业务模型

- **用户端**：填写姓名 / 身份证 / 手机号 / 三项协议 → 提交查询 → 随机生成综合分（600-650 区间，含 4 银行分）→ 结果页展示风险等级。
- **管理端**：JWT 登录、查看客户档案（带历史版本）、评估列表、人工修正评分、查看仪表盘（今日提交数）、监听 `h5.submit.new` WebSocket 事件。
- **同步链**：H5.submit → 事务写入 customer → profile → assessment → score_detail → sync_record → 通过 WS 推送至 PC 后台。

## 快速启动（本地开发）

### 0. 环境要求

- Node.js 18+ （推荐 20 LTS）
- npm 9+
- 可选：Docker（仅生产路径需要；本地开发已支持纯 SQL.js 模式，无需 MySQL）

### 1. 启动后端（端口 3000）

```bash
cd risk-admin/server
cp .env.example .env       # 已含本地开发默认值（DB_DRIVER=sqljs 零依赖）
npm install
npm run start:dev
```

> 首次启动会自动建表（SQL.js 模式：内存型 SQLite 落盘到 `data/`）。

### 2. 启动 H5 用户端（端口 5173）

```bash
cd risk-score-h5
npm install
npm run dev
# 浏览器打开 http://localhost:5173
```

### 3. 启动 PC 后台管理端（端口 5174）

```bash
cd risk-admin/web
npm install
npm run dev
# 浏览器打开 http://localhost:5174
# 默认账号：admin / 123456
```

### 4. （可选）启动真实 MySQL

```bash
cd risk-system
docker compose up -d
# MySQL: 3306  root/risk123456  库 risk_score
# Redis: 6379
```

然后把 `risk-admin/server/.env` 中 `DB_DRIVER=sqljs` 一行删掉，让 TypeORM 自动走 MySQL 驱动。
首次启动时手动执行建表：`mysql -uroot -prisk123456 risk_score < risk-admin/server/db-schema.sql`。

## API 契约

### H5 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/h5/submit` | `{name, idCard, phone}` → 保存并返回 `assessmentNo`（如 `R202609118103`） |
| POST | `/api/h5/query-score` | `{name, idCard, phone}` 或 `{assessmentNo}` → 查询评分 |
| GET | `/api/h5/assessment/:no` | 详情 |

### 后台管理（需 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | `{username, password}` → JWT |
| GET/POST/PUT/DELETE | `/api/admin/customers[/:id]` | 客户管理 |
| POST | `/api/admin/customers/import` | 批量导入 |
| GET | `/api/admin/profiles` | 资料历史版本 |
| GET | `/api/admin/assessments`、详情 `/:id`、重算 `/:id/recalc` | 评估管理 |
| PUT | `/api/admin/scores/:id` | 人工修正评分 |
| GET | `/api/admin/dashboard` | 仪表盘 |

### WebSocket

- 命名空间：`/ws/admin/notify`
- 客户端：`socket.io-client`，监听事件 `h5.submit.new`

## 统一响应格式

```json
{ "code": 0, "message": "success", "data": { } }
```

## 生产部署

```bash
# 三个工程分别构建
cd risk-admin/server && npm run build    # 产物: dist/
cd risk-score-h5      && npm run build   # 产物: dist/
cd risk-admin/web     && npm run build   # 产物: dist/
```

使用 `risk-system/nginx.conf` 作为统一入口。已配好：

| 路径 | 转发目标 |
|------|----------|
| `/` | H5 用户端（`dist/`） |
| `/admin` | PC 后台（`dist/`） |
| `/api` | NestJS 3000 |
| `/ws` | NestJS 3000 + `proxy_read_timeout 3600s`（WebSocket） |

部署时把 nginx.conf 中的 `/srv/risk-score-h5/dist` 与 `/srv/risk-admin-web/dist` 替换为实际路径即可。

## 数据库

8 张核心表（完整 DDL 见 `risk-admin/server/db-schema.sql`）：

```
customer             客户主表
customer_profile     客户资料（带 version + is_current，做历史快照）
risk_assessment      风险评估单（assessment_no 业务唯一号）
score_detail         评分明细（assessment_id + score_type 联合唯一）
                     ├─ score_type='comprehensive' 综合分
                     └─ score_type IN ('boc','icbc','abc','ccb') 四大行
admin_user           后台账号
operation_log        操作审计日志
sync_record          H5 → 同步链路落库
sys_dict             字典
```

## 技术决策

- **H5 移动端 rem 基准 37.5px**（375px 设计稿），全量用 SCSS `$spacing-*` / `$font-size-*` 变量
- **风险阈值**：800+ 绿 #00C853，600-799 橙 #FF9900，0-599 红 #FF3D00
- **银行枚举**：`boc`/`icbc`/`abc`/`ccb`，显示名"中行/工行/农行/建行评分"
- **API 归一化**：综合分 `{score, level:number, levelName}`；银行分 `{scoreType, score, level:number, levelName, trend}`
- **本地开发 DB 驱动可切**：`DB_DRIVER=sqljs`（纯 WASM，零依赖）或默认 `mysql`（生产）

## License

仅供学习与内部演示使用。