# 安居宝停车预订系统服务端

## 设计思路
### 后端设计
1. 数据层不做任何数据校验，只做数据存储
2. 订单创建与订单状态更新这类存在大量数据涌入的接口，使用 RabbitMq 进行异步，减轻数据库压力，同时数据库操作使用事务进行，保证数据一致性。
### 前端设计
1. 走MVC模式，样式使用 LayUI，使用 Axios 进行数据交互。
2. 管理页使用 iframe 嵌套，整体页面框架使用 LayUI 自带的默认框架体系。

### 数据库设计
1. 订单评价这种需要大批量单独查询的数据，使用单独的表存储，仅在订单表中留下编号链接字段。
2. 订单表中存储订单状态，订单状态变更时，更新订单状态，同时更新订单状态变更时间。

## 部署

### 配置文件

项目使用`.env`文件作为配置文件，配置文件内容如下：
```env
PORT=3000

# Database
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
DB_SYNCHRONIZE=true

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
MQ_HOST=
MQ_PORT=
MQ_QUEUE=

# JWT
JWT_SECRET=secret
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=3600

# Tencent Location Service
TENCENT_LOCATION_SERVICE_KEY=
```