# Ứng dụng PCCC — server Node.js tĩnh + API đồng bộ (không cần thư viện)
FROM node:22-alpine

WORKDIR /app

# Copy mã nguồn (html, js, server...). Dữ liệu KHÔNG nằm trong image.
COPY . .

# Dữ liệu lưu ở /data — gắn Persistent Storage trong Coolify vào đường dẫn này
ENV PORT=3000 \
    HOST=0.0.0.0 \
    DATA_DIR=/data
RUN mkdir -p /data

EXPOSE 3000

# Coolify dùng healthcheck này để biết app đã sẵn sàng
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
