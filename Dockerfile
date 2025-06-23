#syntax=docker/dockerfile:1.17
FROM node:22.12.0-alpine3.19 AS base

# DEPS
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --link .npmrc package.json package-lock.json ./

RUN npm ci

# BUILDER
FROM base AS builder
WORKDIR /app

# copy files
COPY --from=deps --link /app/node_modules ./node_modules
COPY --link  . .

# build
RUN npm run build

# RUNNER
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN \
  addgroup --system --gid 1001 nodejs; \
  adduser --system --uid 1001 nodejs

COPY --link package.json ./
COPY --from=deps --link /app/node_modules ./node_modules
COPY --from=builder --link --chown=1001:1001 /app/dist ./dist

RUN npm prune --production

USER nodejs

CMD ["node", "dist/index.js"]