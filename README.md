# ACT Frontend

> The Open Threat Intelligence Platform

## Installation

```bash
git clone https://github.com/mnemonic-no/act-frontend.git
```

Edit `src/config.js` to point to your act platform api server

```json
  "apiUrl": "http://YOUR-API-SERVER-HERE/",
```

Currently access control is hard coded, if necessary edit `actUserId`

### Install dependencies

You will need to have installed [yarn](https://yarnpkg.com) or [npm](https://www.npmjs.com/get-npm)

```bash
yarn install
```

### Run the development server

```bash
yarn start
```

### Deploy

```bash
yarn build
```

This will create a folder `build/` with static files ready to be deployed.
