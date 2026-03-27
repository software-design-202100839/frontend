# === Stage 1: Build ===
FROM node:22-alpine AS builder

WORKDIR /app

# 패키지 파일 먼저 복사 (캐시 활용)
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사 + 빌드
COPY . .
RUN npm run build

# === Stage 2: Runtime ===
FROM nginx:alpine

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물만 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
