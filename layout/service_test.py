import requests
import json

url = 'http://127.0.0.1:5000/layout/embeddings'
data = {
    'words': ['the', 'is', 'RANDOM', 'STUFF'],
    'min': 0,
    'max': 100,
}

req = requests.post(url, data)
print(req.json())
