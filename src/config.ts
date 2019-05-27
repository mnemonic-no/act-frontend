import rawConfig from './config.json';

type Config = {
    [key: string] : any
}

let config : Config = rawConfig;

// Set by react scripts
if (process.env.NODE_ENV === 'development') {
    config = {...rawConfig, ...require('./config.override.json')}
}

export default config;