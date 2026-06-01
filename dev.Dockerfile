FROM node:26-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
ENTRYPOINT ["npm"]
CMD ["run", "dev"]