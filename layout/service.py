from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from layout import load_layout, load_csv_embeddings, coordinates, fit_range
from random import random, seed
import numpy as np
RANDOM_SEED = 123451251
DEFAULT_RANGE = (0,100)
DIM = 300

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

embeddings = { word: embedding for word, embedding in zip(*load_csv_embeddings('embeddings/test.txt', ' ')) }
embeddings_layout = load_layout('layout/test.layout.csv')

def generate_similarity_layout(words, embeddings, target_range=DEFAULT_RANGE):
    """
    Generates a layout for the given words from the given embeddings dictionary.
    Coordinates are based on the similarity between words.
    Returns a list of coordinates, one for each given word.

    If a word is not in the dictionary, a semi-random coordinate is returned instead.
    'max' determines the maximum value of coordinates.
    """
    np.random.seed(RANDOM_SEED)
    X = [embeddings.get(word, np.random.random(DIM) * target_range[1]) for word in words]
    points = coordinates(X)
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
    print('payload:')
    print(req)
    words = req.get('words')
    target_range = req.get('range', DEFAULT_RANGE)
    coords = generate_similarity_layout(words, embeddings, target_range)
    print('generated coordinates:')
    print(coords)
    return { 'points': json_friendly(coords) }
