# Stage 1: install dependencies
FROM node:20-alpine AS development

# Set working directory
WORKDIR /usr/src/app

# Install and cache app dependencies for development
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

# Install dependencies
RUN yarn install

# Copy existing application directory contents
COPY --chown=node:node . .

USER node


# Stage 2: build
FROM node:20-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Install and cache app dependencies for production
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

# Use node_modules from development stage to build dist folder
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

# Copy existing application directory contents
COPY --chown=node:node . .

ENV NODE_ENV=production

# Build source
RUN yarn build

# Install production dependencies and clear cache
RUN yarn install --production && yarn cache clean

USER node


# Stage 3: run
FROM node:20-alpine AS production

# Copy production dependencies and build artifacts
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Start application in production environment
CMD [ "node", "-r", "module-alias/register", "/dist/index.js" ]

# Expose application port
EXPOSE 4010
