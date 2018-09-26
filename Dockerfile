FROM node:alpine


WORKDIR /opt

COPY . .

RUN apk update && apk upgrade && apk add --update wget

RUN wget -v -O dotProm.tar.gz -L https://ibm.box.com/shared/static/6qdsydaq6cuko0uu4kvkkhdu6mw1xbyu.gz
RUN tar -xvf dotProm.tar.gz
RUN mv dotProm ~/.ProM68

EXPOSE 3000

#The `CMD` command must resolve to a property in the `scripts` object in the `package.json` file. It must be in the root of the directory you are executing your `CMD` command from.
CMD ["npm", "start"]