FROM node:20-alpine as BASE

FROM base AS DEPS
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* .npmrc* ./

RUN corepack enable pnpm && pnpm i --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG PG_CONNECTION_STRING
ENV NEXT_TELEMETRY_DISABLED = 1

RUN corepack enable pnpm && pnpm build

FROM base AS runner
WORKDIR /app 
ENV NODE_ENV=production

ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public* ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/server ./.next/server
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

USER nextjs
EXPOSE 3000
ENV PORT=3000

ARG HOSTNAME
CMD ["node", "dist/server.js"] 