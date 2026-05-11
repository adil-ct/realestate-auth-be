import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import DeviceDetector from 'node-device-detector';
import geoip from 'geoip-lite';
import db from '../connections/dbMaster.js';
import config from '../config/config.js';
import logger from '../config/logger.js';
import constants from '../config/constants.js';
import messages from '../config/messages.js';
import Logins from '../components/auth/model.js';
import { sendEmail } from '../helpers/aws_ses.js';
const User = db.collection('user');
const Admin = db.collection('admin');

const { ObjectId } = mongoose.Types;

export const generateJWTToken = async (payload, ip, userAgent) => {
  try {
    logger.info('Inside generate JWT token jwt service');
    const { _id, type } = payload;
    const jwtExpiresIn = payload.rememberMe === true ? constants.REMEMBER_ME_EXPIRY : constants.JWT_EXPIRES_IN;
    delete payload.rememberMe;

    const deviceDetector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: false,
    });

    let device = await deviceDetector.detect(userAgent);

    device = {
      device: device?.client?.name,
      version: device?.client?.version,
      os: device?.os?.name + ' ' + device?.os?.platform,
      type: device?.device?.type,
    };

    const geo = geoip.lookup(ip);

    const geolocation = {
      country: geo?.country,
      region: geo?.region,
      timezone: geo?.timezone,
      city: geo?.city,
    };
    const loginDevices = await Logins.find({
      user_id: _id,
    });
    let existingLogin;
    loginDevices.map((device) => {
      device.currentDevice = false;
      if (device.ip_address === ip) {
        device.currentDevice = true;
        device.logged_out = false;
        existingLogin = device;
      }
    });

    if (!existingLogin) {
      existingLogin = await Logins.create({
        user_id: _id,
        ip_address: ip,
        currentDevice: true,
        type,
        device,
        location: geolocation,
        jwtExpiresIn,
        logged_in_at: new Date(),
      });

      if (payload?.firstTimeLogin && payload?.firstTimeLogin === true) {
      } else {
        // await sendEmail(payload?.email, 'NEW_DEVICE_SIGNED_IN', {
        //   email: payload.email,
        //   device_name: device?.device ? device?.device : 'N/A',
        //   time: moment().tz('America/New_York').format('LLL'),
        //   location: geolocation?.region ? geolocation.region : 'N/A' + geolocation?.country ? geolocation?.country : 'N/A',
        //   ip_address: ip ? ip : 'N/A',
        //   url: await config?.baseUrl,
        // });
      }
    }else {
      await Logins.updateOne({  _id: existingLogin._id }, { $set: {
        logged_in_at: new Date(),
      } });

    }

    payload.deviceId = existingLogin._id;
    await Logins.updateMany({ user_id: _id }, { $set: loginDevices });
    const token = jwt.sign(payload, await config.jwtSecretKey, {
      expiresIn: jwtExpiresIn,
    });

    return token;
  } catch (err) {
    logger.error(err.message);
    return { error: err.message };
  }
};

export const verifyJWTToken = async (jwtToken, ip, userAgent) => {
  try {
    const verification = jwt.verify(jwtToken, await config.jwtSecretKey);
    let user;
    if (verification) {
      const existingLogin = await Logins.findOne({
        _id: verification.deviceId,
      });
      if (existingLogin?.logged_out || existingLogin === null) {
        return { error: messages.UNAUTHORIZED_ACCESS };
      }
      if (verification.type === 'user') {
        user = await User.findOne({ _id: ObjectId(verification._id) });
      } else {
        user = await Admin.findOne({ _id: ObjectId(verification._id) });
      }
      if (!user || user == '') {
        return { error: messages.UNAUTHORIZED_ACCESS };
      }
      user.deviceId = verification?.deviceId;
      return user;
    }
    return { error: messages.UNAUTHORIZED_ACCESS };
  } catch (err) {
    logger.error(err);
    return { error: err.message };
  }
};
