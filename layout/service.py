import os.path
from flask import Flask, request, jsonify
from layout import load_layout
from random import random, seed
app = Flask(__name__)
available_layouts = [ 
    'embeddings'
]
layouts = { 'embeddings': load_layout('layout/test.layout.csv') }
RANDOM_SEED = 123451251

def get_coordinates(words, layout, max=100):
    seed(RANDOM_SEED) 
    coordinates = []
    for word in words:
        try:
            coordinates.append(list(layout[word]))
        except KeyError:
            coordinates.append([random() * max, random() * max])
    return coordinates

@app.route('/')
def hello_world():
    return 'Service is Running!'

@app.route('/layout/embeddings', methods=[ 'POST' ])
def make_layout():
    form = request.form
    words = form.get('words')
    coordinates = get_coordinates(words, layouts['embeddings'])
    return { 'points': coordinates }
