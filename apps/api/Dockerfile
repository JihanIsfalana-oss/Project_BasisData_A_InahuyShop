FROM node:22-alpine AS dependencies

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@12.16.1 --activate

COPY . .

RUN pnpm install --filter api... --frozen-lockfile \
  && pnpm --filter @inahuyshop/database db:generate

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /workspace

COPY --from=dependencies --chown=node:node /workspace/node_modules ./node_modules
COPY --from=dependencies --chown=node:node /workspace/apps/api ./apps/api
COPY --from=dependencies --chown=node:node /workspace/packages/contracts ./packages/contracts
COPY --from=dependencies --chown=node:node /workspace/packages/database ./packages/database

USER node

EXPOSE 3000

CMD ["node", "apps/api/src/server.js"]
