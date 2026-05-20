import aws from 'aws-sdk';
import config from '../config/config.js';
import logger from '../config/logger.js';
import constants from '../config/constants.js';

const pinpoint = new aws.Pinpoint({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const send_otp = async (mobileNumber) => {
  logger.info('Inside send otp aws pipeline service');
  const params = {
    ApplicationId: constants.APPLICATION_ID,
    SendOTPMessageRequestParameters: {
      BrandName: constants.BRAND_NAME,
      Channel: 'SMS',
      DestinationIdentity: mobileNumber,
      OriginationIdentity: constants.ORIGINATION_IDENTITY,
      ReferenceId: constants.REFERENCE_ID,
      AllowedAttempts: constants.ALLOWED_ATTEMPTS,
      CodeLength: constants.CODE_LENGTH,
      ValidityPeriod: constants.EXPIRATION_TIME,
    },
  };
  const data = await new Promise((success, failure) => {
    pinpoint.sendOTPMessage(params, function (err, data) {
      if (err) {
        failure(err.message);
      } else {
        success(data);
      }
    });
  });
  if (data.MessageResponse.Result[`${mobileNumber}`].StatusCode !== 200) {
    return { error: data.MessageResponse.Result[`${mobileNumber}`].StatusMessage };
  } else {
    return true;
  }
};

export const verify_otp = async (mobileNumber, code) => {
  logger.info('Inside verify otp aws pipeline service');
  return true;
  // var params = {
  //   ApplicationId: constants.APPLICATION_ID,
  //   VerifyOTPMessageRequestParameters: {
  //     DestinationIdentity: mobileNumber,
  //     Otp: code,
  //     ReferenceId: constants.REFERENCE_ID,
  //   },
  // };
  // const data = await new Promise((success, failure) => {
  //   pinpoint.verifyOTPMessage(params, function (err, data) {
  //     if (err) {
  //       failure(err.message);
  //     } else {
  //       success(data.VerificationResponse.Valid);
  //     }
  //   });
  // })
  //   .then((data) => data)
  //   .catch((err) => ({
  //     error: err,
  //   }));
  // if (data?.error) {
  //   return { error: data.error };
  // } else {
  //   return data;
  // }
};
