# Visualisation Frontend

The frontend of the visualisation tool.


# Requirements & Setup

+ [NodeJs](https://nodejs.org/en/download/)
+ ([Docker](https://docs.docker.com/))

1. Install _NodeJs_. 
2. Install all node dependencies, using `npm install`. 

# Running the Tool

To run the tool in a development environment, simply run 

```bash
ng serve
```

The tool will be available under http://localhost:4200.

To run the tool in a production environment, follow these steps:

1. build the tool, using `ng build --prod`
2. build the docker image, using `docker image build`
3. start the docker container, using `docker container run -d`
