import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import logger from '../config/logger.js';
import messages from '../config/messages.js';
import config from '../config/config.js';

export const authGenerator = async (email) => {
  logger.info('Inside auth generator helper service');
  const secret = authenticator.generateSecret();
  const response = await new Promise(async (resolve, reject) => {
    QRCode.toDataURL(authenticator.keyuri(email, await config.authenticatorName, secret), (err, url) => {
      if (err) {
        reject({ error: err.message });
      }
      resolve({ url, secret });
    });
  })
    .then((data) => data)
    .catch((err) => ({ error: err }));
  return response;
};

export const authValidator = async (code, secret) => {
  logger.info('Inside auth validator helper service');
  if (!authenticator.check(code, secret)) {
    return { error: messages.OTP_INCORRECT };
  } else {
    return true;
  }
};
