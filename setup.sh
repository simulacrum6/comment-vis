#! /bin/bash
cd layout/ &&
conda env create -f -y layout_service.environment.yml &&
cd embeddings/
wget "http://nlp.stanford.edu/data/glove.840B.300d.zip" &&
unzip "glove.840b.300d.zip" &&
rm "glove.840b.300d.zip" &&
cd ../../frontend/visualisation-frontend/ &&
npm install
