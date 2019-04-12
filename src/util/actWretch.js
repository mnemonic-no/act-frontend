import wretch from 'wretch';
import config from '../config';

const w = wretch()
  .url(config.apiUrl)
  .options({ mode: 'cors', credentials: 'include' })
  .headers({
    'ACT-User-ID': config.actUserId,
    Accept: 'application/json'
  })
  .errorType('json');

export default w;
