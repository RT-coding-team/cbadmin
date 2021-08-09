# cbadmin
Redesigned Connectbox Admin Interface

## Build

To build this frontend admin interface, install dependencies and run the `build` with `yarn`:

```
yarn install
yarn build
```

This creates a folder dist with all static files to deploy: 

- `admin.html`, `login.html`: the entry points (point to one of these with nginx or similar)
- `admin.bundle.js` & `login.bundle.js`: the specific scripts for the views
- `main.css` & `main.bundle.js`: the common bundles for style and scripts
- Some font files

## Deploy [Danger]

On your local machine, the script `deploy` __delete content__ of `/var/www/html/*` and copy dist to this repertory. Make sure to keep this repertory clear to avoid loss of data. Make sure to open the right write permission for this dir.

On distant machine, copy all files from dist and point nginx to serve them in a static way.
