FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY packages ./packages

WORKDIR /app/apps/web
CMD ["pnpm", "run", "dev"]
