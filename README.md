# cbadmin
Redesigned Connectbox Admin Interface

# Introduction
Watch [this video](https://www.loom.com/share/c8f7deb037b4445c8ad3be3e0f44318e?sharedAppSource=personal_library)

## Build

To build this frontend admin interface, install dependencies and run the `build` with `yarn`:

```
yarn install
yarn build
```

This creates a folder `dist` with all static files to deploy: 

- `index.html`, `login.html`: the entry points (point to one of these with nginx or similar)
- `admin.bundle.js` & `login.bundle.js`: the specific scripts for the views
- `main.css` & `main.bundle.js`: the common bundles for style and scripts
- Some font files

## Customize 

To customize this admin frontend, you can, according to your needs:

- Update the colors and style main variables, in `/src/styles/_config.scss`
- Override style in `/src/styles/index.scss`
- Update the templates in `/src/templates`
- Update the logic in `/src/js`
  - In `/admin`, modules to load the previous settings, the reports, to perform system scripts, and to update setting, and to logout
  - In `/api`, an abstraction of the api, with some helpers `get, put, post` to submit requests
  - In `/components`, some logic to make components reactive (accordions, switches, snackbar)
  - In `/utils`, a helper to convert utf-8 to base64 (to send password in the right format)
  - `index.js` load computed styles from scss
  - `admin.js` and `login.js` are entry points compiled to bundle for login and admin pages

Do not forget to recompile it with `yarn build` and to deploy (see next section)

## Deploy [Danger]

On your local machine, the script `deploy` __delete content__ of `/var/www/html/*` and copy dist to this repertory. Make sure to keep this repertory clear to avoid loss of data. Make sure to open the right write permission for this dir. You also need to allow CORS in distant api nginx configuration. For instance : 
```nginx
location /admin/api {
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header Host $http_host;
  if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Credentials' 'true';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
    add_header 'Access-Control-Max-Age' 1728000;
    add_header 'Content-Type' 'text/plain charset=UTF-8';
    add_header 'Content-Length' 0;
    return 204;
  }
  if ($request_method = 'POST') {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Credentials' 'true';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT,  OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
  }
  if ($request_method = 'GET') {
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type' always;
  }
  if ($request_method = 'PUT') {
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type' always;
  }
  proxy_redirect off;
  proxy_pass http://127.0.0.1:5000/admin/api;
  # Never cache
  expires -1;
}

location /__connectbox_assets__ {
  alias /var/www/connectbox/connectbox_default;
  add_header 'Access-Control-Allow-Origin' '*' always;
  location ~ \.json$ {
    expires -1;
  }
}
```
(This should not remain in production. It just allows to send requests from another server, as from localhost to distant server)


On distant machine, copy all files from `dist` and point nginx to serve them in a static way. For instance:
```nginx
server {
    ...
    
    location /admin {
      alias /var/www/html/admin;
    }
}
```
