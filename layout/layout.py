import numpy as np
from sklearn.manifold import TSNE
from sklearn.cluster import AgglomerativeClustering
from random import random

def load_csv_embeddings(file_path, separator=',', encoding='utf-8'):
    """
    Loads embeddings from the given csv file.
    Assumes that the first each entry in each line represents the word,
    while the rest represents the embedding.

    Returns a tuple, the words and coordinates.
    """
    embeddings = []
    words = []
    with open(file_path, 'r', encoding=encoding) as f:
        print('reading line count...')
        for i,_ in enumerate(f):
            pass
        lines = i + 1
    with open(file_path, 'r', encoding=encoding) as f:
        print('loading {} embeddings...'.format(lines))
        progress = -1
        for i, line in enumerate(f):
            word, *vector = line.split(separator)
            embedding = np.array([float(x) for x in vector], dtype='float64')
            words.append(word)
            embeddings.append(embedding)
            current = int(i / lines * 100)
            if current % 5 == 0 and progress < current:
                progress = current
                print('{}% '.format(progress), end='')
    print('done!')
    return (words, embeddings)

def t_sne_coordinates(xs, dimensions=2):
    """Maps the given vectors to a vector in the given dimension, based on their similarity, using t-SNE."""
    X = np.array([x for x in xs])
    return TSNE(n_components=dimensions).fit_transform(X)

def scatter(labels, centroids, scatter_factor = 0.05):
    """
    Generates a list of coordinates, randomly scattered around the given centroids.
    scatter_factor determines, how far coordinates are scattered around the centroids.
    Labels must be a list of indices of centroids. 
    Each entry in label is scattered around its corresponding cenroid.
    Centroids is assumed to be two-dimensional.
    """
    coordinates = []
    for i in labels:
        x,y = centroids[i]
        coordinate = [x + random() * scatter_factor, y + random() * scatter_factor]
        coordinates.append(coordinate)
    return coordinates

def hierarchical_coordinates(xs, threshold):
    """Maps the given vectors to a vector in the given dimension, based on their similarity, using hierarchical clustering."""
    X = np.array([x for x in xs])
    clustering = AgglomerativeClustering(n_clusters=None, distance_threshold=threshold)
    cluster_labels = clustering.fit_predict(X)
    print(clustering.n_clusters_)
    # set cluster centroids
    centroids = [[random(), random()] for _ in range(clustering.n_clusters_)]
    return scatter(cluster_labels, centroids)

def layout(words, coordinates):
    """Creates a dict of map to coordinates"""
    return { word: coordinate for word, coordinate in zip(words, coordinates)}

def layout_from_embeddings_file(path, seperator=' ', encoding='utf-8', coordinate_dimensions=2):
    words, embeddings = load_csv_embeddings(path, seperator, encoding)
    return layout(words, t_sne_coordinates(embeddings, coordinate_dimensions))

def save_layout(layout, path, seperator='\t', encoding='utf-8'):
    with open(path, 'w+', encoding=encoding) as f:
        for word,coordinate in layout.items():
            word = word.replace(r'{}'.format(seperator), 'SEPARATORSYMBOL'.format(seperator))
            coordinate = [str(val) for val in coordinate]
            f.write(seperator.join([word, *coordinate]) + '\n')

def load_layout(path, separator='\t', encoding='utf-8'):
    """
    Loads layout from the given csv file.
    Assumes that the first each entry in each line represents the word,
    while the rest represents the coordinates.

    Returns a dictionary from word to coordinates.
    """
    layout = {}
    with open(path, 'r', encoding=encoding) as f:
        print('reading line count...')
        for i,_ in enumerate(f):
            pass
        lines = i + 1
    with open(path, 'r', encoding=encoding) as f:
        print('loading {} coordinates...'.format(lines))
        progress = -1
        for i, line in enumerate(f):
            word, *vector = line.split(separator)
            coordinate = np.array([float(x) for x in vector], dtype='float64')
            layout[word] = coordinate
            current = int(i / lines * 100)
            if current % 5 == 0 and progress < current:
                progress = current
                print('{}% '.format(progress), end='')
    print('done!')
    return layout

def fit_range(X, target_min, target_max):
    """Assumes X is a np.array of shape (n,)"""
    data_max = np.max(X)
    data_min = np.min(X)
    data_range = data_max - data_min
    target_range = target_max - target_min
    convert = lambda x: ((x - data_min) / data_range * target_range) + target_min
    return np.array([[convert(x) for x in xs] for xs in X])

__test_embeddings__ = 'embeddings/test.txt'
__test_layout__ = 'layout/test.layout.csv'
__glove_embeddings__ = 'embeddings/glove.840B.300d.txt'
__glove_layout__ = 'layout/glove.840B.300d.txt'
__layout_doc__ = """
layout
Converts embedding files to layout files.

usage: 
    python layout [input_file] [output_file]
parameters:
    input_file:     Path to embeddings file to use for the layout. 
                    Must be compatible with layout.load_csv_embeddings.
    output_file:    File to store layout in.
"""

if (__name__=='__main__'):   
    print('Running "layout.py" for usage information, pass "--h" as parameter.')
    import sys
    import datetime
    default_input = __glove_embeddings__
    default_output = 'layout/custom_${}.layout.txt'.format(int(datetime.datetime.now().timestamp()))
    args = sys.argv[1:]
    try:
        args[0]
        if args[0] == '--help' or args[0] == '-h':
            sys.exit(__layout_doc__)
        else:
            input_path = args[0]
    except IndexError:
        input_path = default_input
        print('No input embeddings privided. Using default at "{}"'.format(default_input))
    try:
        output_path = args[1]
    except IndexError:
        output_path = default_output
        print('No output file provided. Using default at "{}"'.format(default_input))
    print('Trying to build layout from embeddings at "{}"'.format(input_path))
    print('Storing results at "{}"'.format(output_path))
    layout = layout_from_embeddings_file(input_path)
    save_layout(layout, output_path)
