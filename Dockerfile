# NutriMind-AI container image.
# Multi-stage: build the Vite frontend + esbuild server bundle in a Node
# image, then copy only the artifacts into a slim runtime image.

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install deps with lockfile fidelity (npm ci requires package-lock.json).
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy sources and build the production server bundle + frontend assets.
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY server ./server
COPY prisma ./prisma
COPY server.ts ./
# Generate the Prisma client so the bundled server can talk to the DB.
RUN npx prisma generate
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy the built server, frontend assets, and Prisma schema/generated client.
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Express serves the Vite build from the project root; keep index.html for
# static asset resolution.
COPY index.html ./

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
