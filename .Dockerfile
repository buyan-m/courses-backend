FROM node:18-alpine

WORKDIR "/home/app"
COPY . .

ENTRYPOINT ["node", "dist/src/main"]