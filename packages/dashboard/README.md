## @sidetree/dashboard

This package is work in progress.

This package contains a Next.js app for sidetree nodes.

### Add a Custom Logo to the Dashboard

Create a file named `.evt.local` in this directory (next to `package.json`),
and populate it with your logo URL's (without square brackets).

```
LOGO_LIGHT=[Light Logo on Dark Background URL]
LOGO_DARK=[Dark Logo on Light Background URL]
```

### Building with Docker

This command does not work yet, need to address package manager differences (yarn vs npm)

```
docker-compose up
```

### Instructions for deploying on GCP

WIP

See https://github.com/vercel/next.js/blob/canary/examples/with-docker/README.md
