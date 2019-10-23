FROM continuumio/miniconda3:4.7.12-alpine

COPY layout.py layout.py
COPY service.py service.py
COPY embeddings/* embeddings/
ADD layout_service.environment.yml layout_service.environment.yml

ENV PATH /opt/conda/bin:$PATH
RUN conda env create -f layout_service.environment.yml
ENV PATH /opt/conda/envs/layout_service/bin:$PATH
RUN activate layout_service
ENV FLASK_APP service.py

CMD python -m flask run
