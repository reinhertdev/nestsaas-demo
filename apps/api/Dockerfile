FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM deps AS builder
WORKDIR /app
COPY apps/api ./apps/api
COPY packages ./packages
WORKDIR /app/apps/api
RUN pnpm run build

# ---- runner ----
FROM node:24-alpine AS runner
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/start.sh ./apps/api/start.sh
RUN chmod +x ./apps/api/start.sh

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3001

CMD ["./start.sh"]
