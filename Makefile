.PHONY: all models site test clean

PYTHON = python

all: models site

models:
	@echo "Generando reconstrucciones físicas..."
	$(PYTHON) machines/ramelli_book_wheel/model.py
	$(PYTHON) machines/vitruvius_archimedes_screw/model.py
	# Añadir otras cuando se implementen
	@echo "Modelos completados."

site: models
	@echo "Generando sitio web estático..."
	$(PYTHON) web/generator.py
	@echo "Sitio generado en site/index.html"

test:
	pytest tests/

clean:
	rm -rf site
	find . -name "*.svg" -type f -delete
