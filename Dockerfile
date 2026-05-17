# syntax=docker/dockerfile:1.7
# aniradio production container — multi-stage Next.js standalone build
# Final image is ~250MB: node-alpine base + ~215MB of generated audio.

# 1. deps — install ALL deps (incl dev) for the build step
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. builder — build the Next.js standalone bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The .dockerignore excludes app/api/ + .env* + scripts/ etc., so this
# build sees only what should ship to prod.
RUN npm run build

# 3. runner — minimal runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as a non-root user for safety.
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy the standalone server, the static assets it needs, and the public/
# directory (which contains all the generated mp3s + manifests).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run sets PORT; default to 3000 for local docker run.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
