FROM node:current-alpine

WORKDIR /app

COPY ./server /app

RUN npm install

RUN echo "PORT=9000" > .env \
    && echo "DATABASE_URL=postgres://admin:example@db.local:5432/chess" >> .env

CMD ["npm", "start"]
