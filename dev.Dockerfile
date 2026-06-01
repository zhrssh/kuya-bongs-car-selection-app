FROM node:26-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
ENTRYPOINT ["npm"]
CMD ["run", "dev"]