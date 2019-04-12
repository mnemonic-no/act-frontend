import rawConfig from './config.json';

let config = rawConfig;

// Set by react scripts
if (process.env.NODE_ENV === 'development') {
    config = {...rawConfig, ...require('./config.override.json')}
}

export default config;