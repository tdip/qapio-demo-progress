.PHONY: static-files
.PHONY: clean

static-files:
	npx parcel build --public-url "/static/pivot-table/" src/index.html

clean:
	rm -rf node_modules/

node_modules: clean
	npm i

