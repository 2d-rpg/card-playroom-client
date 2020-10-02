FROM node:12.18.4-slim

RUN apt update \
    && apt install -y --no-install-recommends \
    apt-utils \
    git \
    ca-certificates \
    procps \
    osascript \
    && npm install expo-cli --global \
    && npm install typescript --global \
    && npm install tslint --global \
    && apt autoremove -y \
    && apt clean -y \
    && rm -rf /var/lib/apt/lists/* \
