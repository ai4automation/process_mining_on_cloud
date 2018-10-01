FROM node:alpine


COPY . /app
WORKDIR /app
RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > .build_time

# Install glibc and useful packages
RUN echo "@testing http://nl.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && apk --update add \
    bash \
    curl \
    ca-certificates \
    libstdc++ \
    glib \
    libxext \
    libxrender \
    && curl "https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub" -o /etc/apk/keys/sgerrand.rsa.pub \
    && curl -L "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.23-r3/glibc-2.23-r3.apk" -o glibc.apk \
    && apk add glibc.apk \
    && curl -L "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.23-r3/glibc-bin-2.23-r3.apk" -o glibc-bin.apk \
    && apk add glibc-bin.apk \
    && /usr/glibc-compat/sbin/ldconfig /lib /usr/glibc/usr/lib \
    && rm -rf glibc*apk /var/cache/apk/*


RUN apk update && apk upgrade && apk add --update \
     make \
     cmake \
     gcc \
     g++ \
     git \
     pkgconf \
     unzip \
     wget \
     build-base \
     gsl \
     libavc1394-dev \
     libtbb@testing \
     libtbb-dev@testing \
     libjpeg \
     libjpeg-turbo-dev \
     libpng-dev \
     libdc1394-dev \
     clang \
     tiff-dev \
     libwebp-dev \
     linux-headers \
     xvfb \
     p7zip

ENV CC /usr/bin/clang
ENV CXX /usr/bin/clang++

RUN apk add apache-ant

# Java Version and other ENV
ENV JAVA_VERSION_MAJOR=8 \
    JAVA_VERSION_MINOR=181 \
    JAVA_VERSION_BUILD=13 \
    JAVA_PACKAGE=jdk \
    JAVA_HOME=/app/jdk \
    PATH=${PATH}:/app/jdk/bin \
    LANG=C.UTF-8

RUN wget -v -O java.tar.gz -L https://ibm.box.com/shared/static/d6gf809c5gdwulkfgsfhbbhwm9n7m5lh.gz

RUN gunzip java.tar.gz && \
    tar -C /app -xf java.tar && \
    ln -s /app/jdk1.${JAVA_VERSION_MAJOR}.0_${JAVA_VERSION_MINOR} /app/jdk && \
    echo 'hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4' >> /etc/nsswitch.conf

RUN wget -v -O dotProm.tar.gz -L https://ibm.box.com/shared/static/6qdsydaq6cuko0uu4kvkkhdu6mw1xbyu.gz
RUN tar -xvf dotProm.tar.gz
RUN mv dotProm ~/.ProM68

EXPOSE 3000

#The `CMD` command must resolve to a property in the `scripts` object in the `package.json` file. It must be in the root of the directory you are executing your `CMD` command from.
CMD ["npm", "start"]