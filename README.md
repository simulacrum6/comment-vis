# CommentVis

CommentVis is a tool for visualizing large collections of sentiment annotated comments.

# Requirements and Setup

* Angular CLI
* Anaconda3
* Docker Compose

After installing the required software, run the `setup.sh` script.
For more detailed instructions, see the readme files under `layout/` and `frontend/visualisation-frontend/`.

# Running the tool

To start the tool, run the `deploy.sh` script.
Alternatively, you can build the Angular App manually and then run docker-compose. 

```
cd frontend/visualisation-frontend/ &&
ng build --prod &&
cd ../.. &&
docker-compose build
docker-compose up -d
```
