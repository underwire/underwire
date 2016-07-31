const ENV_LOOKUP = {
  development: 'dev',
  production: 'prd',
  prod: 'prd',
  stage: 'stg',
};
const ENVIRONMENT_LOOKUP = {
  dev: 'development',
  stg: 'stage',
  prd: 'production',
};
const ENV = ENV_LOOKUP[process.env.NODE_ENV]||'dev';
const ENVIRONMENT = ENVIRONMENT_LOOKUP[ENV];

module.exports = {
  ENV,
  ENVIRONMENT,
};
