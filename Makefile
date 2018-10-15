
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test release

test:
	$(shell npm bin)/mocha tests/**/*-tests.js

release: test
	npm version patch
	git push origin $(git_branch)
	npm publish --access public
