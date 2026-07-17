#!/bin/sh
set -e

# 运行数据库迁移（如果数据库不存在会自动创建）
echo "Running database migrations..."
npx prisma migrate deploy

# 启动 Next.js
echo "Starting Next.js..."
exec npm start