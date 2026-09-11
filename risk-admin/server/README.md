# 风险评分系统后端 (NestJS + TypeORM + MySQL)

H5 用户端与 PC 后台管理端共用的 API 服务骨架。

- 技术栈：NestJS 10 + TypeScript(strict) + TypeORM + MySQL8 + socket.io
- 鉴权：JWT（默认账号 `admin / 123456`，内存校验占位）
- 统一响应：`{ code, message, data }`
- 实时同步：WebSocket 命名空间 `/ws/admin/notify`，事件 `h5.submit.new`

---

## 一、环境要求

- Node.js >= 18
- MySQL 8.0（需提前建库）
- npm

---

## 二、建库（执行 SQL）

```bash
# 1. 进入 MySQL
mysql -uroot -p

# 2. 执行建表脚本（自动创建 risk_admin 库与 8 张表）
source /path/to/risk-admin/server/db-schema.sql
```

脚本位置：`risk-admin/server/db-schema.sql`
> 后端 `synchronize: true` 时也会自动建表；生产建议关闭 synchronize 并改用迁移。

---

## 三、环境变量

复制 `.env.example` 为 `.env` 并修改：

```bash
cp .env.example .env
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| DB_HOST | MySQL 主机 | localhost |
| DB_PORT | MySQL 端口 | 3306 |
| DB_USER | 用户名 | root |
| DB_PASSWORD | 密码 | （空） |
| DB_DATABASE | 数据库名 | risk_admin |
| JWT_SECRET | JWT 签名密钥 | risk-admin-secret |
| PORT | 服务端口 | 3000 |

---

## 四、安装依赖

```bash
cd risk-admin/server
npm install
```

---

## 五、启动

```bash
# 开发模式（热重载）
npm run start:dev

# 或编译后启动
npm run build
npm run start:prod
```

服务启动后：

- API 基础路径：`http://localhost:3000/api`
- WS 推送：`ws://localhost:3000/ws/admin/notify`

---

## 六、主要接口一览

### 公开接口（H5，无需登录）
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/h5/submit` | 提交用户信息（事务：查/建客户 → 写资料 → 创建评估 → Mock 评分 → 广播） |
| POST | `/api/h5/query-score` | 查询评分（按 assessmentNo 或 name+idCard+phone） |
| GET  | `/api/h5/assessment/:no` | 评估详情 |

### 后台接口（需 JWT）
登录拿 token 后，请求头携带 `Authorization: Bearer <token>`。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 管理员登录，返回 JWT |
| GET  | `/api/admin/customers` | 客户列表（分页 + 搜索 name/phone/riskLevel） |
| POST | `/api/admin/customers` | 新增客户 |
| PUT  | `/api/admin/customers/:id` | 编辑客户 |
| DELETE | `/api/admin/customers/:id` | 软删除客户 |
| POST | `/api/admin/customers/import` | 批量导入 `{ list: [...] }` |
| GET  | `/api/admin/profiles` | H5 资料记录列表 |
| GET  | `/api/admin/assessments` | 评估记录列表 |
| GET  | `/api/admin/assessments/:id` | 评估详情（含 score_detail） |
| POST | `/api/admin/assessments/:id/recalc` | 手动重算 |
| PUT  | `/api/admin/scores/:id` | 人工修正评分（写 is_manual/manual_reason） |
| GET  | `/api/admin/dashboard` | 工作台统计 |
| GET  | `/api/admin/users` | 管理员列表 |
| GET  | `/api/admin/logs` | 操作日志列表 |

### 登录示例
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"123456"}'
# => { "code":0, "message":"success", "data": { "token":"...", "user": {...} } }
```

### H5 提交示例
```bash
curl -X POST http://localhost:3000/api/h5/submit \
  -H 'Content-Type: application/json' \
  -d '{"name":"张三","idCard":"110101199001011234","phone":"13800138000"}'
```

---

## 七、目录结构

```
risk-admin/server/
├── src/
│   ├── common/             # 守卫/装饰器/拦截器/过滤器/工具/常量
│   │   ├── guards/jwt-auth.guard.ts
│   │   ├── decorators/current-user.decorator.ts
│   │   ├── interceptors/response.interceptor.ts
│   │   ├── filters/all-exceptions.filter.ts
│   │   ├── utils/{crypto.util,mask.util}.ts
│   │   └── constants/risk-level.ts
│   ├── entities/           # 8 张表实体（TypeORM @Entity）
│   ├── modules/
│   │   ├── auth/           # 登录 + JWT
│   │   ├── customer/       # 客户主数据 CRUD
│   │   ├── profile/        # H5 资料记录
│   │   ├── assessment/     # 评估/评分 + Mock 评分服务
│   │   ├── dashboard/      # 工作台统计
│   │   ├── admin-user/     # 管理员账号
│   │   ├── log/            # 操作日志
│   │   └── h5/             # 公开接口（提交/查询/详情）
│   ├── websocket/          # WS 实时同步网关
│   ├── app.module.ts
│   └── main.ts
├── db-schema.sql           # 建表 SQL
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env.example
```

---

## 八、说明与待完善（TODO）

- 身份证加密为占位实现（AES-256-CBC + 硬编码密钥），生产应替换为 KMS / 密钥托管 + AES-256-GCM。
- 登录校验走内存默认账号，生产应查 `admin_user` 表 + `bcrypt.compare`。
- 操作日志采用 service 注入方式记录前后快照；可后续增强为装饰器/AOP 拦截。
- `synchronize: true` 仅适合开发；生产请改用 TypeORM 迁移。
- 评分服务为 Mock（确定性伪随机），真实模型接入 `src/modules/assessment/scoring.service.ts` 即可。
