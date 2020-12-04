import rawConfig from './config.json';
import { TConfig } from './core/types';

let config: TConfig = rawConfig;

// Set by react scripts
if (process.env.NODE_ENV === 'development') {
  config = { ...rawConfig, ...require('./config.override.json') };
}

export default config;
