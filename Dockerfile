FROM node:24

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 4000
ENTRYPOINT [ "yarn" ]
CMD [ "start" ]
