# AKJ Dojo UI
This is an ui app using [Create React App (Typescript)](https://github.com/facebook/create-react-app). It includes the following customizations
* stylelint + style-lint-recommended
* using nlf-helmet for title and meta tag management
* prettier for css and ts / tsx files

## Project scripts
See full package.json for full configuration.

### Install and development
* `npm install`
* `npm run start`

### Linting and tests
* `npm run lint`
* `npm run lint:ts`
* `npm run lint:style`
* `npm run test`

### Builds and running production
* `npm run build`
* `node build/`

#### Prerender
* `npm run prerender`

## Environment Vars
See [create react app env vars](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables) for more details:
* Note: You must create custom environment variables beginning with `REACT_APP_*`
* `.env`: Default.
* `.env.local`: Local overrides. This file is loaded for all environments except test.
* `.env.development`, `.env.test`, `.env.production`: Environment-specific settings.
* `.env.development.local`, `.env.test.local`, `.env.production.local`: Local overrides of environment-specific settings.

Example
```
REACT_APP_SECRET_CODE=abcdef
```

| Environment Var | Development | Production      |
|-------------|-----------------|------------------|
| NODE_ENV | development | production |
| PORT  | 3000  | |
| HOST  | 0.0.0.0 | |
| PUBLIC_URL | | |
| HTTPS | | true |
| REACT_APP_BASE | http://localhost:3000/ | https://austin.komeijyuku.com/ |


## AWS deployment and git branches
Uses [CircleCI](https://circleci.com/) for CI/CD.
* pushes to master will go to production
* TODO: pushes to git int/* branches will go to the staging environment

## TODO Tasks
* [ ] split up original css file for each component
* [ ] higher res homepage icons on image CTAs
* [x] NoMatch component min viewport width
* [ ] progressive web app icons and manifest config
* [ ] manifest and apple app settings updates
* [ ] a11y support with typescript
* [x] make drop down nav accessible w/ aria attributes
* [x] 404 page 100vh minus quote + padding
* [x] prerender with react snap
* [x] circle ci setup and test

