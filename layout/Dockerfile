FROM continuumio/miniconda3:4.7.12-alpine

COPY layout.py layout.py
COPY service.py service.py
COPY embeddings/* embeddings/
COPY layout/* layout/
COPY layout_service.environment.yml layout_service.environment.yml

RUN conda env create -f layout_service.environment.yml
RUN conda activate layout_service
RUN export FLASK_APP=service.py

CMD python -m flask run
