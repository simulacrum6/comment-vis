import numpy as np
from sklearn.manifold import TSNE

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

def coordinates(xs, dimensions=2):
    """Maps the given vectors to a vector in the given dimension, based on their similarity."""
    X = np.array([x for x in xs])
    return TSNE(n_components=dimensions).fit_transform(X)
    
def layout(words, coordinates):
    """Creates a dict of map to coordinates"""
    return { word: coordinate for word, coordinate in zip(words, coordinates)}

def layout_from_embeddings_file(path, seperator=' ', encoding='utf-8', coordinate_dimensions=2):
    words, embeddings = load_csv_embeddings(path, seperator, encoding)
    return layout(words, coordinates(embeddings, coordinate_dimensions))

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

test_embeddings = 'embeddings/test.txt'
test_layout = 'layout/test.layout.csv'
glove_embeddings = 'embeddings/glove.840B.300d.txt'
glove_layout = 'layout/glove.840B.300d.txt'

if (__name__=='__main__'):    
    layout = layout_from_embeddings_file(glove_embeddings)
    save_layout(layout, glove_embeddings)   
    #layout = layout_from_embeddings_file(test_embeddings)
    #save_layout(layout, test_layout)
