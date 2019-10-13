import requests
import json

url = 'http://127.0.0.1:5000/layout/embeddings'
data = {
    'words': ['the', 'is', 'RANDOM', 'STUFF'],
    'range': [0,100]
}

req = requests.post(url, json=data)
print(req.json())

url = 'http://127.0.0.1:5000/layout/clustered'

req = requests.post(url, json=data)
print(req.json())
