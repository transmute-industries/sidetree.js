# Sidetree.js

![CI](https://github.com/transmute-industries/sidetree.js/workflows/CI/badge.svg)

- [NPM](https://www.npmjs.com/package/sidetree.js)

Placeholder for refactoring element-lib.

https://github.com/decentralized-identity/element

### Docker Commands

You may find it useful to prune all docker data:

```
docker system prune
```

### IPFS

In order to access IPFS API from a browser, you will need to enable CORs.

In order to do this on the docker container run the following and then restart the container:

```
docker exec ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
docker exec ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
```
