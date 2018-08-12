# AKJ Dojo UI
This is an ui app using [TypeScript-React-Starter](https://github.com/Microsoft/TypeScript-React-Starter), which is based on 
[Create-React-App](hhttps://github.com/facebook/create-react-app).  It includes the following customizations
* stylelint + style-lint-recommended
* using nlf-helmet for title and meta tag management

## Project scripts
See full package.json for full configuration.

### Install and development
* `npm install`
* `npm run start`

### Linting and tests
* `npm run lint`
* `npm run lint:style`
* `npm run test`

### Builds and running production
* `npm run build`
* `node build/`

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
| REACT_APP_GA_ID | | UA-5370840-1 |


## AWS deployment and git branches
Uses [CircleCI](https://circleci.com/) for CI/CD.
* pushes to master will go to production
* TODO: pushes to git int/* branches will go to the staging environment

## TODO Tasks
* [ ] split up original css file for each component
* [ ] NoMatch component min viewport width
* [ ] progressive web app icons and manifest config
* [ ] a11y support with typescript
