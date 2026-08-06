FROM node:22-slim

# wrangler's local runtime (workerd) needs these; the slim image ships neither.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies first, so a source edit does not reinstall node_modules.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# 8787 is wrangler's default. --ip 0.0.0.0 is required inside a container:
# bound to localhost the port is unreachable from the host.
EXPOSE 8787
CMD ["npx", "wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]
