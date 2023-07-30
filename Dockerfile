FROM node:18.12.0-alpine

WORKDIR /app

COPY . .

RUN npm install

ARG NODE_ENV
ARG ENCRYPTION_PRIVATE_KEY

ENV NODE_ENV=$NODE_ENV
ENV ENCRYPTION_PRIVATE_KEY=$ENCRYPTION_PRIVATE_KEY

RUN touch private.pem && echo "$ENCRYPTION_PRIVATE_KEY" >> private.pem

RUN npm run decrypt-config

RUN rm private.pem

CMD ["npm", "start"]