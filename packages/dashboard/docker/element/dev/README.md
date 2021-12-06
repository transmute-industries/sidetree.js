### Element on Ganache

🚧 Be especially cautious not to reuse secrets between environments.

Its important to be able to develop and test blockchain and distributed services with 100% local dependencies.

These instructions cover setting up and testing element without connecting to real testnet or external services.

### Configuration

By default you do not need to make any changes to `element.dev.env`.

If you make changes to that file, you MUST be careful that they do not expose secret or senstive values.

You may need to adjust the dashboard config and api and app code to see any changes you make to the environment file.

### Running

You can change the evironment file that will be used by docker-compose,
we recommend not changing any values of the file associated with
running element in a development configuration.

From the root directory of sidetree.js:

```bash
docker-compose \
--file ./packages/dashboard/docker/element/dev/docker-compose.element.dev.yml  \
--env-file ./packages/dashboard/docker/element/dev/element.dev.env up
```

Or via npm:

```
npm run element:dev
```
