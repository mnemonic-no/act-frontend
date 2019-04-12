# ACT Frontend

> The Open Threat Intelligence Platform

## Installation

```bash
git clone https://github.com/mnemonic-no/act-frontend.git
```

### Install dependencies

You will need to have installed [yarn](https://yarnpkg.com) or [npm](https://www.npmjs.com/get-npm)

```bash
yarn install
```

### Run the development server

Copy the `config.override.json.template` to  `config.override.json` and set the relevant API URL for your development 
environment. 

```json
  { "apiUrl": "http://YOUR-API-SERVER-HERE/" }
```

Currently access control is hard coded, if necessary edit `actUserId`

Run development server with:

```bash
yarn start
```

### Deploy

Edit the config.json to reflect your production environment, i.e set the apiUrl for the ACT backend.


```bash
yarn build
```

This will create a folder `build/` with static files ready to be deployed.
