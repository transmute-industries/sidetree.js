# TSDX Bootstrap

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

### IPFS

In order to access IPFS API from a browser, you will need to enable CORs.

In order to do this on the docker container run the following and then restart the container:

```
docker exec ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
docker exec ipfs ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
```
