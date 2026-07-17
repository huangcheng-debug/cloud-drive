# ---- Build Stage ----
FROM node:22-slim AS build
WORKDIR /app

# better-sqlite3 编译依赖
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建 Next.js
RUN npm run build

# ---- Production Stage ----
FROM node:22-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

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