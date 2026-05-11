import logger from '../../config/logger.js';
import messages from '../../config/messages.js';
import { handleError, handleResponse } from '../../helpers/requestHandler.js';
import { send_otp, verify_otp } from '../../helpers/aws_pinpoint.js';
import { sendEmail } from '../../helpers/aws_ses.js';
import { generateJWTToken, verifyJWTToken } from '../../helpers/jwt.js';
import { authGenerator, authValidator } from '../../helpers/authenticator.js';
import { sendingEmailRequest } from './validator.js';
import Verification from './verification.model.js';
import db from '../../connections/dbMaster.js';
import { GenerateRandomNumberOfLength } from '../../helpers/helper.js';
import dateFormats from '../../helpers/date.js';
const Country = db.collection('countryCode');
const Cities = db.collection('cities');
const Subdivision = db.collection('subdivision');

export const sendJWTToken = async (req, res) => {
  try {
    logger.info('Inside send JWT Token API controller');
    const ip = req.body.ip ?? null;
    const userAgent = req.body.userAgent ? req.body.userAgent : req.headers['user-agent'];

    const token = await generateJWTToken(req.body, ip, userAgent);
    if (token?.error) {
      return handleError({ res, err: token.error });
    }
    return handleResponse({ res, msg: messages.JWT_TOKEN, data: token });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    logger.info('Inside verify JWT Token API controller');
    if (!req.headers.authorization) {
      return handleError({ res, err: messages.UNAUTHORIZED_ACCESS });
    }

    const token = req.headers.authorization.split(' ')[1];
    const user = await verifyJWTToken(token);
    if (user?.error) {
      return handleError({
        res,
        statusCode: 401,
        err: user.error || messages.SOMETHING_WENT_WRONG,
      });
    }
    return handleResponse({ res, msg: messages.TOKEN_VERIFIED, data: user });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};

export const sendOTP = async (req, res) => {
  try {
    logger.info('Inside send verification code API controller');
    const { channel, mobileNumber, email } = req.body;
    if (!channel) return handleError({ res, err: messages.CHANNEL_REQUIRED, statusCode: 400 });
    let request;
    if (channel === 'SMS') {
      request = await send_otp(mobileNumber);
      if (request?.error) return handleError({ res, err: request.error });
    } else if (channel === 'Email') {
      const otp = '123456'; // await GenerateRandomNumberOfLength(6);
      // request = await sendEmail(email, 'VERIFY_EMAIL', { otp: parseInt(otp) });
      // if (request?.error) {
      //   return handleError({ res, err: request.error });
      // }
      const otpExist = await Verification.findOne({ email });
      if (otpExist) {
        await Verification.updateOne(
          { email },
          {
            code: otp,
            expiresAt: dateFormats.emailExpiryTime(dateFormats.getCurrentDateTime()),
          }
        );
      } else {
        await Verification.create({
          email: email,
          code: otp,
          expiresAt: dateFormats.emailExpiryTime(dateFormats.getCurrentDateTime()),
        });
      }
    } else {
      return handleError({ res, err: messages.INVALID_CHANNEL, statusCode: 400 });
    }
    return handleResponse({ res, msg: messages.OTP_SENT_SUCCESS });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    logger.info('Inside verify OTP API controller');
    const { mobileNumber, code } = req.body;
    const verify = await verify_otp(mobileNumber, code);
    if (verify?.error) {
      return handleError({ res, err: verify.error });
    }
    if (verify) {
      return handleResponse({ res, msg: messages.OTP_VERIFIED });
    }
    return handleError({
      res,
      err: messages.OTP_INCORRECT,
      statusCode: 400,
    });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};

export const emailSending = async (req, res) => {
  try {
    logger.info('Inside email sending API controller');
    const validate = await sendingEmailRequest(req.body);
    if (validate.error) {
      return handleError({ res, err: validate.message });
    }
    const { email, type, request } = req.body;
    const send = await sendEmail(email, type, request);
    if (send?.error) {
      return handleError({ res, err: send.error });
    }
    return handleResponse({ res, msg: messages.EMAIL_SENT_SUCCESS });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};

export const addToAuthenticator = async (req, res) => {
  try {
    logger.info('Inside add to authenticator API controller');
    const authenticator = await authGenerator(req.body.email);
    if (authenticator?.error) {
      return handleError({ res, err: authenticator.error });
    }
    return handleResponse({ res, data: authenticator, msg: messages.AUTHENTICATOR_SUCCESS });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};

export const validateAuthenticator = async (req, res) => {
  try {
    logger.info('Inside validate authenticator API controller');
    const { code, secret } = req.body;
    const validator = await authValidator(code, secret);
    if (validator?.error) {
      return handleError({ res, err: validator.error, statusCode: 400 });
    }
    return handleResponse({ res, msg: messages.OTP_VERIFIED });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};

export const getCountry = async (req, res) => {
  try {
    logger.info('Inside get coutry API controller');
    const coutry = await Country.find({}, { country_name: 1 }).sort({ country_name: 1 }).toArray();
    if (coutry?.error) {
      return handleError({ res, err: coutry.error });
    }
    return handleResponse({ res, msg: messages.SUCCEESS, data: coutry });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};

export const getCities = async (req, res) => {
  try {
    logger.info('Inside get cities API controller');
    const country = req.params.country;
    const match = req.query.search;
    const cities = await Cities.findOne();
    if (cities?.error) {
      return handleError({ res, err: cities.error });
    }
    const data = cities[country.charAt(0).toUpperCase() + country.slice(1)];
    if (!data) {
      return handleError({ res, err: messages.DATA_IS_NOT_VALID });
    }

    if (match) {
      let matches = data.filter((s) => s.includes(match.charAt(0).toUpperCase() + match.slice(1)));
      return handleResponse({ res, msg: messages.SUCCEESS, data: matches });
    }
    return handleResponse({ res, msg: messages.SUCCEESS, data: data });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};

export const getDistrict = async (req, res) => {
  try {
    logger.info('Inside get district API controller');
    const query = req.params.country;
    const country = query.charAt(0).toUpperCase() + query.slice(1);
    const subdivision = await Subdivision.findOne({ country });
    if (subdivision?.error) {
      return handleError({ res, err: subdivision.error });
    }
    if (!subdivision) {
      return handleError({ res, err: messages.DATA_IS_NOT_VALID });
    }
    return handleResponse({ res, msg: messages.SUCCEESS, data: subdivision });
  } catch (err) {
    logger.error(err.message);
    return handleError({ res, err: err.message });
  }
};
