#! /bin/bash
cd frontend/visualisation-frontend/ &&
ng build --prod &&
cd ../.. &&
docker-compose build &&
docker-compose up -d
