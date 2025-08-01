const { env } = process;

const nodeEnv = env.NODE_ENV;
const appPort = env.APP_PORT;
const byPassSecurity = env.BY_PASS_SECURITY || "";
const appKeyOne = env.APP_KEY_1;
const appKeyTwo = env.APP_KEY_2;
const appBaseUrl = env.APP_BASE_URL;
const mailgunApiKey = env.MAILGUN_API_KEY || "default-api-key";
const mailgunDomain = env.MAILGUN_DOMAIN || "default-domain";
const contactUsUsername = env.CONTACT_US_USERNAME;
const captchaSecret = env.CAPTCHA_SECRET;
const jwtSecret = env.JWT_SECRET || "default-secret-key";
const cookieDomain = env.COOKIE_DOMAIN;
const stripeKey = env.STRIPE_KEY;
const hashSecret = env.HASH_SECRET;
const dbUrl = env.DB_URL;
const createPasswordUrl = env.CREATE_PASSWORD_URL;
const userPoolName = env.USER_POOL_NAME;
const userPoolClientName = env.USER_POOL_CLIENT_NAME;
const userPoolClientId = env.USER_POOL_CLIENT_ID;

export {
  nodeEnv,
  dbUrl,
  appPort,
  byPassSecurity,
  appKeyOne,
  appKeyTwo,
  appBaseUrl,
  mailgunApiKey,
  mailgunDomain,
  contactUsUsername,
  captchaSecret,
  jwtSecret,
  cookieDomain,
  stripeKey,
  hashSecret,
  createPasswordUrl,
  userPoolName,
  userPoolClientName,
  userPoolClientId,
};
