# Layout Service

This folder contains a service providing a layout for a list of words. 
A layout is simply a list of points, one for each word.

# Requirements & Setup

+ [Anaconda](https://www.anaconda.com/distribution/)

1. Install _Anaconda_ for the platform of your choice. 
2. Install environment, using `conda env -f layout_service.environment.yml`. 
3. Set Flask App environment variable, using `export FLASK_APP=service.py`.


***NOTE:*** On Windows you need to run `set FLASK_APP=service.py` to set the variable.

# Running the Service

To run the service in a development environment, follow these steps:

1. Activate the environment, using `activate layout_service.yml`-
2. Start the service, run `python -m flask run`.

***NOTE:*** On Windows you need to run `./<anaconda.dir>/condabin/activate layout_service` to activate the environment.

## Production Deployment

In case you want to use the layouting functionality in a production environment, you should probably use a [different server](https://flask.palletsprojects.com/en/1.1.x/deploying/#deployment). 
