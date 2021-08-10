FROM node:14

# RUN add-apt-repository ppa:ubuntu-toolchain-r/test
RUN apt update
RUN apt install libstdc++6

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 4000
ENTRYPOINT [ "yarn" ]
CMD [ "start" ]