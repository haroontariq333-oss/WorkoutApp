FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY public ./public
COPY server ./server
# Starts as root only to take ownership of the data disk, then switches to the "node" user (uid/gid 1000).
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data RUN_AS_UID=1000 RUN_AS_GID=1000
RUN mkdir -p /data
EXPOSE 3000
CMD ["node", "--disable-warning=ExperimentalWarning", "server/server.js"]
