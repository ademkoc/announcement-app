SOURCE_FILES:=$(shell find src/ -type f -name '*.ts')

all: build

build: dist/build package-lock.json

start: build
	npm run migration:up
	npm i -g pm2
	pm2 start "MIKROORM_PREFER_TS=false node --env-file=.env dist/src/server.js" --name announcement-app

dist/build: $(SOURCE_FILES)
	node_modules/.bin/tsc

package-lock.json: package.json
	npm i

clean:
	rm -r dist

.PHONY:all build start clean