# Layout Service

A service providing a layout for a list of words. 
A layout is simply a list of 2d points, one for each word.

## API Specification

`POST /layout/embeddings`

The service endpoint. Takes the words under the `words` property, converts them into coordinates and returns an array of coordinates.
Currently, only [t-SNE](https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html#examples-using-sklearn-manifold-tsne) is supported as layouting function.

* _Required Request Headers_: `Content-Type: application/json`
* _Request Payload_: JSON Object, must contain property `words` (array of strings), may contain `range` (array of two numbers). If `range` is provided, the returned points are constrained to the minimum and maximum values in the range (default `[0,100]`).
* _Response_ string, representing a JSON array of `points`. Each point is an array, containing two numbers (`x` and `y` coordinates).  

`GET /`

Just for testing if the service is running.
* _Response_ string, `Hello World!`


# Requirements & Setup

+ [Anaconda](https://www.anaconda.com/distribution/)
+ [GloVe Embeddings](https://nlp.stanford.edu/projects/glove/) (preferably _840b, 300d_ variant)

1. Install _Anaconda_ for the platform of your choice. 
2. Install environment, using `conda env -f layout_service.environment.yml`. 
3. Download and store embeddings in `./embeddings`

***NOTE:*** In case you are not using the GloVe 840b, 300d variant of embeddings, you may need to change the path to the embeddings loaded in `./service.py`.

# Running the Service

To run the service in a development environment, follow these steps:

1. Activate the environment, using `activate layout_service.yml`
2. Set Flask App environment variable, using `export FLASK_APP=service.py`.
3. Start the service, run `python -m flask run`.

***NOTE:*** On Windows you need to run `./<anaconda.dir>/condabin/activate layout_service` to activate the environment.\
***NOTE:*** On Windows you need to run `set FLASK_APP=service.py` to set the variable.\

## Production Deployment

In case you want to use the layouting functionality in a production environment, you should probably use a [different server](https://flask.palletsprojects.com/en/1.1.x/deploying/#deployment). 
