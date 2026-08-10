# Conferencer — single-container deploy.
#   docker compose up -d --build     (or: npm run deploy)
FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1

# ---------------------------------------------------------------- deps ------
FROM base AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts=false

# --------------------------------------------------------------- build ------
FROM base AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --------------------------------------------------------------- runner -----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# schema.sql, the seed script and its fixtures ship with the image so a fresh
# volume can be initialised with `docker compose exec app npm run seed`.
COPY --from=build /app/schema.sql ./schema.sql
COPY --from=build /app/seed ./seed
COPY --from=build /app/scripts ./scripts
COPY --from=deps /app/node_modules ./node_modules

RUN mkdir -p /data/uploads
VOLUME ["/data"]
EXPOSE 3000

CMD ["node", "server.js"]
