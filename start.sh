#!/bin/sh
set -e

echo "Starting cloud-drive..."

# 确保工作目录正确
cd /app

# 运行数据库迁移
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration skipped (already applied)"

# 启动 Next.js（使用 Railway 的 PORT 环境变量，默认 3000）
echo "Starting Next.js on port ${PORT:-3000}..."
exec npx next start -p "${PORT:-3000}" -H 0.0.0.0