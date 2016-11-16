FROM node:6.3.0
MAINTAINER Neil Paul Molina

RUN apt-get update
RUN apt-get install -y ca-certificates software-properties-common build-essential
RUN apt-get -y upgrade
RUN apt-get -y dist-upgrade

RUN mkdir -p /usr/src/
RUN npm install -g yarn nodemon
WORKDIR /usr/src/

EXPOSE 8000

CMD ["npm", "start"]
