FROM --platform=linux/amd64 node:22.2.0-slim

# Update package lists and upgrade packages to reduce vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get clean

WORKDIR /usr/src/app

ADD . .

RUN npm ci --legacy-peer-deps

RUN npm run build

CMD ["node", "dist/main.js"]
