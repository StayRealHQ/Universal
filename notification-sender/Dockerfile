FROM node:lts-slim
WORKDIR /app

RUN npm install -g pnpm tsx

COPY tsconfig.json package.json pnpm-lock.yaml ./
RUN pnpm install
RUN mkdir ./src
COPY ./src/*.ts ./src/

CMD ["tsx", "./src/index.ts"]
