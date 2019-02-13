#base image
FROM node:latest as build

#set working dir
WORKDIR /srv/sanction_list_crawler

#send some variables
ENV DEFAULT_USERNAME bcordero
ENV PORT 80

#expose some ports
EXPOSE 80

#copy all files
COPY . /srv/sanction_list_crawler

#install packages
RUN npm install

#set entry point
CMD ["node","server.js"]
