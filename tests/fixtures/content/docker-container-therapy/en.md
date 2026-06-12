---
title: "Docker Container Therapy"
date: "2018-01-20"
description: "How Docker promised to solve 'works on my machine' and instead gave us a whole new category of problems to debug, plus the joy of multi-stage builds."
tags:
  - tools
language: en
author: "Alex Kucherenko"
draft: false
---

"Works on my machine" used to be a developer's last line of defense. A magical incantation that deflected blame from your code to the mysterious forces of environment configuration. Docker was supposed to kill that phrase. Package your app in a container, ship the container, and it works everywhere. In theory, this is elegant. In practice, I've spent more time debugging Dockerfiles than I ever spent debugging environment issues.

My first Dockerfile was eleven lines long and took forty-five minutes to build. My current Dockerfile is sixty-three lines long and takes four minutes to build. The journey between those two points involved learning about layer caching, multi-stage builds, Alpine versus Debian base images, and the hard way that `apt-get update` and `apt-get install` must be on the same `RUN` line or your cache will betray you.

## The Layer Cake

Docker images are built in layers, and understanding layers is the difference between a 50MB image and a 2GB image. Every `RUN`, `COPY`, and `ADD` instruction creates a new layer. If you `RUN apt-get install build-essential` in one layer and `RUN apt-get purge build-essential` in the next, congratulations -- your image contains both the installation and the removal, because layers are immutable. It's like trying to lose weight by eating a cake and then throwing away the receipt.

```dockerfile
# Bad: 1.2GB image
FROM node:18
COPY . .
RUN npm install
RUN npm run build

# Better: 180MB image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

Multi-stage builds are Docker's redemption arc. You use a fat image to build, then copy only the artifacts to a slim image for production. It's wasteful in the same way that scaffolding is wasteful -- you build it, use it, tear it down, and nobody sees it in the final product.

## The Philosophy

Docker didn't eliminate environment problems. It containerized them. Instead of "works on my machine," we now say "works in my container," which is the same sentence wearing a different hat. But the hat matters. A container is reproducible, versioned, and shareable. Your machine configuration is none of those things. Trading one set of problems for a better set of problems is, I've learned, what most of engineering actually is.
