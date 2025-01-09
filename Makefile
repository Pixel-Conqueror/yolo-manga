env:
	@python3 -m venv myenv
	@echo "don't forget the cli -> source myenv/bin/activate"

install:
	@sudo apt-get update
	@sudo apt-get install -y tesseract-ocr


init:
	@pip install -r requirements.txt
	@jupyter notebook
	