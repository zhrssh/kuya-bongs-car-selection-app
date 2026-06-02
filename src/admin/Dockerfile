FROM node:26-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build

FROM nginx:1-alpine-slim AS runner
RUN addgroup -g 1001 appgroup \
    && adduser -D -u 1001 -G appgroup appuser
WORKDIR /app
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp && \
    chown -R appuser:appgroup \
    /usr/share/nginx/html \
    /var/cache/nginx \
    /etc/nginx \
    /var/log/nginx \
    /run
USER appuser
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]