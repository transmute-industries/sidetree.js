## @sidetree/dashboard

This package is work in progress.

This package contains a Next.js app for sidetree nodes.

### Add a Custom Logo to the Dashboard

Create a file named `.evt.local` in this directory (next to `package.json`),
and populate it with your logo URL's. `LOGO_LIGHT` is the light colored logo
ontop of the dark background, and `LOGO_DARK` is the dark colored logo on top
of a light background.

```
LOGO_LIGHT=https://i.imgur.com/5OnYS9O.png
LOGO_DARK=https://i.imgur.com/28872lr.png
```

### Building with Docker

This command does not work yet, need to address package manager differences (yarn vs npm)

```
docker-compose up
```

### Instructions for deploying on GCP

WIP

See https://github.com/vercel/next.js/blob/canary/examples/with-docker/README.md
