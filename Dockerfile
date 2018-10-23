FROM node:alpine

COPY . /app
WORKDIR /app
RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > .build_time

RUN apk update && apk upgrade && apk add --update \
    bash \
    curl \
    wget \
    zip \
    p7zip

RUN apk add --update openjdk8-jre graphviz mysql-client fontconfig ttf-dejavu unzip openssl
RUN curl https://www.fontsquirrel.com/fonts/download/open-sans -J -O
RUN unzip open-sans.zip -d /usr/share/fonts
RUN fc-cache -fv

RUN wget -v -O dotProm.tar.gz -L https://ibm.box.com/shared/static/6qdsydaq6cuko0uu4kvkkhdu6mw1xbyu.gz
RUN tar -xvf dotProm.tar.gz
RUN mv dotProm ~/.ProM68

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && \
    apk --no-cache update && \
    apk add --no-cache --virtual .build-deps gifsicle pngquant optipng libjpeg-turbo-utils udev ttf-opensans && \
    apk add --no-cache python alpine-sdk xvfb udev yarn bash 

RUN apk update && apk upgrade

#RUN Xvfb :99 &
ENV DISPLAY=:99

EXPOSE 3000

#The `CMD` command must resolve to a property in the `scripts` object in the `package.json` file. It must be in the root of the directory you are executing your `CMD` command from.
#CMD ["sh", "run.sh"]
CMD ["npm", "run", "startprom"]
