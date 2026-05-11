import dotenv from 'dotenv';

/**
 * Need to add following fields to env:
 * PORT, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 * AWS_SECRETS_MANAGER_ID
 */
dotenv.config();

import AWS from '@aws-sdk/client-secrets-manager';
import moment from 'moment';
const region = process.env.AWS_REGION || 'us-west-1'
const SecretsManager = new AWS.SecretsManager({ region });

const config = {
  db: {
    str: 'DB_STRING',
  },
  jwtSecretKey: 'JWT_SECRET_KEY',
  jwtExpiresIn: 'JWT_EXPIRES_IN',
  sendEmailFrom: 'SEND_EMAIL_FROM',
  baseUrl: 'BASE_URL',
  sendgridApiKey: 'SENDGRID_API_KEY',
  authenticatorName: 'AUTHENTICATOR_NAME',
  supportEmail: 'SUPPORT_EMAIL'
};

let staleAfter = moment.utc();
const cachedConfig = {};
const updateObjProps = (obj, newObj, secretValues) => {
  for (const key in newObj) {
    if (newObj[key]?.constructor?.name === {}.constructor.name) {
      obj[key] = obj[key] ?? {};
      updateObjProps(obj[key], newObj[key], secretValues);
      continue;
    }
    obj[key] = secretValues[newObj[key]] || process.env[newObj[key]];
  }
};

const proxyConfig = new Proxy(config, {
  async get(target, prop, _originalObj) {
    try {
      if (staleAfter.unix() > moment.utc().unix()) return cachedConfig[prop];
      let values = {};
      if (process.env.AWS_SECRETS_MANAGER_ID) {  
        const result = await SecretsManager.getSecretValue({
          SecretId: process.env.AWS_SECRETS_MANAGER_ID,
        });
        values = JSON.parse(result.SecretString);
      } else {
        values = {
          DB_STRING: process.env.DB_STRING,
          JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
          JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
          SEND_EMAIL_FROM: process.env.SEND_EMAIL_FROM,
          BASE_URL: process.env.BASE_URL,
          SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
          AUTHENTICATOR_NAME: process.env.AUTHENTICATOR_NAME,
          SUPPORT_EMAIL: process.env.SUPPORT_EMAIL
        };
      }

      updateObjProps(cachedConfig, target, values);
      staleAfter = moment.utc().add(60, 'seconds');

      return cachedConfig[prop];
    } catch (err) {
      throw err;
    }
  },
});

export default proxyConfig;
