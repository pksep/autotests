/**
 * Config barrel: re-exports ENV, LOGIN_TEST_CONFIG, SELECTORS, PRODUCT_SPECS.
 * Implementation lives in config/ (env.ts, auth.config.ts, selectors.ts).
 * All existing imports from './config' or '../config' remain valid.
 */

export { ENV } from './config/env';
export { LOGIN_TEST_CONFIG } from './config/auth.config';
export { SELECTORS, PRODUCT_SPECS } from './config/selectors';
