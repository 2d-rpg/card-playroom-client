FROM node:14.17.0-buster-slim

RUN apt update \
    && apt install -y --no-install-recommends \
    && mkdir -p /usr/share/man/man1 \
    apt-utils \
    git \
    ca-certificates \
    procps \
    openjdk-11-jdk \
    && npm install --global expo-cli \
    && apt autoremove -y \
    && apt clean -y \
    && rm -rf /var/lib/apt/lists/* \
