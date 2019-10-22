FROM node:12-alpine
COPY dist/* frontend/
RUN npm install -g http-server
CMD http-server frontend/ -p 8080
