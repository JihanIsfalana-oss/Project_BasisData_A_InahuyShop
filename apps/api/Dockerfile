FROM node:22-alpine AS dependencies

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@12.16.1 --activate

COPY . .

RUN pnpm install --filter api... --prod --frozen-lockfile

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /workspace

COPY --from=dependencies --chown=node:node /workspace/node_modules ./node_modules
COPY --from=dependencies --chown=node:node /workspace/apps/api ./apps/api
COPY --from=dependencies --chown=node:node /workspace/packages/contracts ./packages/contracts

USER node

EXPOSE 3000

CMD ["node", "apps/api/src/index.js"]
