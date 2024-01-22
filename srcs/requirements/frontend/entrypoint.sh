#!/bin/sh
echo "starting npm..."
npm install npm@latest

npm install -g @angular/cli
npm install ngx-cookie-service --save

npm start
