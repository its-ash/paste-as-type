NAME := smart-paste-typing
VERSION := $(shell node -p "require('./extension/manifest.json').version")

.PHONY: run build deploy

run:
	python3 -m http.server 8080

build:
	rm -rf build
	cp -R extension build
	mkdir -p dist
	rm -f "dist/$(NAME)-$(VERSION).zip"
	cd build && zip -qrX "../dist/$(NAME)-$(VERSION).zip" . -x '*.map' '*.DS_Store'

deploy: build
	git checkout main
	git add -A
	git commit -m "$$(copilot -sp 'Analyze the staged git changes and generate a concise commit message. Output ONLY the commit message. Do not execute any commands. Do not include quotes, markdown, explanation, or bullet points.')"
	git push origin main
