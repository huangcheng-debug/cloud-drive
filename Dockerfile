# ---- Build Stage ----
FROM node:22-alpine AS build
WORKDIR /app

# 安装 better-sqlite3 编译所需的工具
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建 Next.js
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl

ENV NODE_ENV=production

# 复制依赖和构建产物
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/next.config.* ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/public ./public

# 复制启动脚本
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]
