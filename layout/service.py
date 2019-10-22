from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from layout import load_layout, load_csv_embeddings, t_sne_coordinates, hierarchical_coordinates, fit_range
from random import random, seed
from sklearn.metrics.pairwise import euclidean_distances
import numpy as np
RANDOM_SEED = 123451251
DEFAULT_RANGE = (0,100)
DIM = 300

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

words,vecs = load_csv_embeddings('embeddings/glove.840B.300d.txt', ' ')
vecs = np.array(vecs)
mask = np.random.choice(len(vecs) - 1, 5000)
avg_distance = np.mean(euclidean_distances(vecs[mask]))
print('avg_distance: {}'.format(avg_distance))

embeddings = { word: embedding for word, embedding in zip(words, vecs) }

def generate_similarity_layout(words, embeddings, target_range=DEFAULT_RANGE, layout='t-sne'):
    """
    Generates a layout for the given words from the given embeddings dictionary.
    Coordinates are based on the similarity between words.
    Returns a list of coordinates, one for each given word.

    If a word is not in the dictionary, a semi-random coordinate is returned instead.
    'max' determines the maximum value of coordinates.
    """
    np.random.seed(RANDOM_SEED)
    X = [embeddings.get(word, np.random.random(DIM) * target_range[1]) for word in words]
    if layout == 't-sne':
        points = t_sne_coordinates(X)
    else:
        points = hierarchical_coordinates(X, avg_distance)
    return fit_range(points, target_range[0], target_range[1])
    
def json_friendly(coodinates):
    """Flask does not support numpy data structures for json conversion."""
    return [[float(v) for v in coord] for coord in coodinates]

def get_coordinates(words, layout, target_range=DEFAULT_RANGE):
    """
    Maps words to coordinates by looking them up in the layout.

    If a word is not in the dictionary, a semi-random coordinate is returned instead.
    'max' determines the maximum value of coordinates. 
    """
    seed(RANDOM_SEED) 
    points = []
    for word in words:
        coordinate = list(layout.get(word, [random() * target_range[1], random() * target_range[1]]))
        points.append(coordinate)
    return fit_range(points, target_range[0], target_range[1])

@app.route('/')
@cross_origin()
def hello_world():
    return 'Service is Running!'

@app.route('/layout/embeddings', methods=[ 'POST' ])
@cross_origin()
def generate_layout():
    if (request.is_json):
        req = request.get_json()
    else:
        req = request.form
    words = req.get('words')
    target_range = req.get('range', DEFAULT_RANGE)
    print('generating coordinates...', end='')
    coords = generate_similarity_layout(words, embeddings, target_range)
    print('done!')
    return { 'points': json_friendly(coords) }

@app.route('/layout/clustered', methods=[ 'POST' ])
@cross_origin()
def generate_hierarchical_layout():
    if (request.is_json):
        req = request.get_json()
    else:
        req = request.form
    words = req.get('words')
    target_range = req.get('range', DEFAULT_RANGE)
    print('generating coordinates...', end='')
    coords = generate_similarity_layout(words, embeddings, target_range, layout='hierarchical')
    print('done!')
    return { 'points': json_friendly(coords) }
