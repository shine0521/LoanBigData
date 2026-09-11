# 风险评分系统 · 腾讯云 CloudBase Run 部署手册

> 目标：把 `shine0521/LoanBigData` 仓库里的三个子项目部署到腾讯云 CloudBase Run（Serverless 容器），
> 对外提供 H5 用户端、PC 管理后台、后端 API（含 WebSocket 实时推送）。

---

## 一、部署架构

```
                          ┌─────────────────────────────────────────┐
   用户手机/浏览器 ──────► │   腾讯云 CloudBase（自动 HTTPS 域名）      │
                          │                                           │
                          │  ① H5 服务 (CloudBase Run, 容器端口 80)    │
                          │     nginx 托管静态 + 反代 /api ─────────┐ │
                          │                                         │ │
                          │  ② PC 服务 (CloudBase Run, 容器端口 80)  │ │
                          │     nginx 托管静态 + 反代 /api + /socket.io │ │
                          │                         (WS)            │ │
                          │                                         ▼ ▼
                          │  ③ API 服务 (CloudBase Run, 容器端口 3000) │
                          │     NestJS + TypeORM ──► MySQL (CloudBase  │
                          │                           SQL 型数据库)    │
                          └─────────────────────────────────────────┘
```

- **Redis 不需要**：当前后端代码未实际连接 Redis，部署时直接忽略（docker-compose 里的 redis 仅本地占位）。
- **H5 / PC 是纯静态站点**：用 nginx 容器托管 `dist/`，并把 `/api` 反代到 API 服务域名。
- **WebSocket**：后端 socket.io 与 HTTP 同端口（3000），path `/socket.io`，namespace `/ws/admin/notify`；PC 容器 nginx 反代 `/socket.io` 到 API 服务。
- **三个服务各自独立 HTTPS 域名**（CloudBase 自动分配，如 `xxx.ap-shanghai.app.tcloudbase.com`），也可后续绑定自定义域名。

---

## 二、前置准备（控制台操作）

1. 进入 CloudBase 控制台，确认你的环境（截图里是 `taz-system` 个人版）状态正常。
2. 左侧导航「数据库」→ 开通 **SQL 型数据库（MySQL）**，记下：
   - 连接地址（内网/外网）
   - 端口（3306）
   - 账号/密码（初始化时设置）
3. 确认「云托管 / 服务管理」可用（你截图里已有 `elevator-ai` 服务，说明云托管已开通）。

> ⚠️ 个人版有资源配额限制（容器实例数、CPU/内存）。若部署失败提示配额不足，需升级或按需减小实例规格。

---

## 三、步骤 1：初始化数据库

1. 在 CloudBase MySQL 控制台打开「SQL 执行」或连接到数据库。
2. 执行仓库根 `risk-admin/server/db-schema.sql`（已建库 `risk_admin` + 8 张表）。
   - 该脚本含 `CREATE DATABASE IF NOT EXISTS`，直接整段执行即可。
3. 默认管理员账号：`admin` / `123456`（后端内存校验，见 `auth.service`）。

---

## 四、步骤 2：部署 API 服务

在「云托管 / 服务管理」点击 **新建服务**（或「通过模板部署」→「使用 Git 仓库部署」）：

| 配置项 | 值 |
|--------|-----|
| 服务名称 | `risk-api` |
| 部署方式 | 使用 Git 仓库部署 |
| 代码仓库 | GitHub → `shine0521/LoanBigData` |
| 服务路径（子目录） | 留空（仓库根） |
| Dockerfile 名称 | `./Dockerfile.api` |
| 构建上下文 | 仓库根（默认） |
| 监听端口 | `3000` |
| 触发方式 | 推送到 main 分支时自动部署（或手动部署） |

**环境变量**（控制台「环境变量」中添加，对应 `.env.production.example`）：
```
DB_DRIVER=mysql
DB_HOST=你的CloudBase-MySQL地址
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_DATABASE=risk_admin
JWT_SECRET=随机长字符串(openssl rand -base64 48)
PORT=3000
```

部署完成后记下 API 服务的访问地址，例如：
`https://risk-api-xxxx.ap-shanghai.app.tcloudbase.com`

---

## 五、步骤 3：部署 H5 服务

| 配置项 | 值 |
|--------|-----|
| 服务名称 | `risk-h5` |
| 部署方式 | 使用 Git 仓库部署 |
| 代码仓库 | `shine0521/LoanBigData` |
| Dockerfile 名称 | `./Dockerfile.h5` |
| 监听端口 | `80` |

**环境变量**：
```
API_TARGET=https://risk-api-xxxx.ap-shanghai.app.tcloudbase.com
```
（即上一步 API 服务的地址；H5 容器 nginx 会把 `/api` 反代到这里）

部署完成后 H5 地址如：
`https://risk-h5-xxxx.ap-shanghai.app.tcloudbase.com`

---

## 六、步骤 4：部署 PC 服务

| 配置项 | 值 |
|--------|-----|
| 服务名称 | `risk-pc` |
| 部署方式 | 使用 Git 仓库部署 |
| 代码仓库 | `shine0521/LoanBigData` |
| Dockerfile 名称 | `./Dockerfile.pc` |
| 监听端口 | `80` |

**环境变量**：
```
API_TARGET=https://risk-api-xxxx.ap-shanghai.app.tcloudbase.com
```

部署完成后 PC 后台地址如：
`https://risk-pc-xxxx.ap-shanghai.app.tcloudbase.com`
后台登录：`admin` / `123456`

---

## 七、WebSocket 实时推送说明

- PC 后台打开后会连接同源 `https://risk-pc-xxxx.../socket.io`（namespace `/ws/admin/notify`）。
- PC 容器 nginx 已配置 `/socket.io` 反代到 `API_TARGET`（API 服务），长连接 3600s 超时。
- H5 提交评分后，API 通过 `h5.submit.new` 事件实时推送到 PC 后台（无需刷新）。
- 已修复：原 `useWebSocket.ts` 硬编码 `localhost:3000`，现改为 `window.location.origin`（同源），上线后正常。

---

## 八、自定义域名 / HTTPS（可选）

- CloudBase Run 默认分配 `*.app.tcloudbase.com` HTTPS 域名，已加密，可直接用。
- 如需自有域名：控制台「服务设置」→「自定义域名」绑定，按提示加 CNAME 解析即可。

---

## 九、验证清单

1. 打开 H5 地址，填写姓名/身份证/手机号，提交 → 显示综合评分 + 4 家银行分。
2. 打开 PC 后台，登录 `admin/123456` → 客户列表 / 评估列表应出现刚提交的数据。
3. PC 后台打开状态下再次提交 H5 → PC 应实时收到「新提交」通知（WebSocket）。
4. 浏览器控制台无 CORS / 404 / WS 连接错误。

---

## 十、本地代码改动清单（本次部署新增/修改）

| 文件 | 说明 |
|------|------|
| `Dockerfile.api` | 后端多阶段构建镜像（node:20-alpine） |
| `Dockerfile.h5` | H5 静态站点镜像（nginx + 反代） |
| `Dockerfile.pc` | PC 静态站点镜像（nginx + 反代 + WS） |
| `risk-score-h5/nginx-default.conf.template` | H5 nginx 配置模板（envsubst 注入 API_TARGET） |
| `risk-admin/web/nginx-default.conf.template` | PC nginx 配置模板（含 /socket.io 反代） |
| `risk-admin/server/.env.production.example` | 生产环境变量模板 |
| `risk-admin/web/src/hooks/useWebSocket.ts` | **修复**：WS 地址由硬编码 localhost 改为同源 |
| `cloudbase-deploy.md` | 本手册 |

> 注意：所有改动需先 `git push` 到 GitHub（`main` 分支），CloudBase Run 的 Git 部署才会拉到最新代码。
> 推荐配置 SSH key 后 `git push`（避免每次输入 PAT）；或重新生成 fine-grained PAT（scope: contents:write）后推送。

---

## 十一、常见问题

- **构建失败 / 找不到 Dockerfile**：确认「Dockerfile 名称」填的是 `./Dockerfile.api`（带 `./` 和点号）。
- **API 连不上数据库**：检查 `DB_HOST` 是否填了 CloudBase MySQL 的**实际连接地址**（非 localhost），且白名单/网络安全组允许容器访问。
- **H5/PC 接口 404**：确认环境变量 `API_TARGET` 已填且末尾无多余斜杠；nginx 模板已自动拼接 `/api/`。
- **WebSocket 不推送**：确认 PC 服务环境变量 `API_TARGET` 指向 API 服务，且 PC 容器 nginx 的 `/socket.io` 反代已生效（见步骤六配置）。
- **容器空载计费**：CloudBase Run 按实例运行时长计费；H5/PC 是静态站点也可用「静态网站托管」（更省），但需另开通，本手册按统一容器方案编写。
