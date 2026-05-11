import clientMail from '@sendgrid/mail';
import client from '@sendgrid/client';
import db from '../connections/dbMaster.js';
import config from '../config/config.js';
import logger from '../config/logger.js';
import constants from '../config/constants.js';
const userModel = db.collection('user');
clientMail.setApiKey(await config.sendgridApiKey);
client.setApiKey(await config.sendgridApiKey);

export const sendEmail = async (email, type, request) => {
  let to;
  type === 'GRANTING_EARLY_ACCESS' || 'KYC_VERIFIED' || 'REWARDS' ? (to = email) : (to = [email]);
  let message;
  request.url = await config.baseUrl;
  request.marketplace_url = (await config.baseUrl) + '/marketplace';
  request.portfolio_url = (await config.baseUrl) + '/portfolio';
  request.payment_url = (await config.baseUrl) + '/accounts';
  request.property_url = (await config.baseUrl) + '/marketplace';
  request.settings_url = (await config.baseUrl) + '/account-settings';
  // if (type === 'PROPERTY') {
  //   const requestSG = {
  //     url: `/v3/mail/batch`,
  //     method: 'POST',
  //   };
  //   const [Response] = await client.request(requestSG);
  //   const userEmails = userModel.find({}).project({ email: 1 });
  //   to = await userEmails.toArray();
  //   to = to.map((item) => item.email);
  //   const batchId = Response.body.batch_id;
  //   message = [
  //     // [COMING SOON]
  //     {
  //       from: {
  //         name: constants.fromname,
  //         email: await config.sendEmailFrom,
  //       },
  //       to: to,
  //       template_id: constants.templateIds.PROPERTY_COMING_SOON,
  //       dynamic_template_data: request ? request : {},
  //       batchId,
  //     },
  //     // [15 MINUTES BEFORE]
  //     {
  //       from: {
  //         name: constants.fromname,
  //         email: await config.sendEmailFrom,
  //       },
  //       to: to,
  //       template_id: constants.templateIds.PROPERTY_15_MINUTES_BEFORE_LIVE,
  //       dynamic_template_data: request ? request : {},
  //       sendAt: parseInt((new Date(request.startDate).getTime() - 15 * 60 * 1000) / 1000),
  //       batchId,
  //     },
  //     // [FINAL LAUNCH]
  //     {
  //       from: {
  //         name: constants.fromname,
  //         email: await config.sendEmailFrom,
  //       },
  //       to: to,
  //       template_id: constants.templateIds.PROPERTY_LAUNCH_FINAL,
  //       dynamic_template_data: request ? request : {},
  //       sendAt: parseInt(new Date(request.startDate).getTime() / 1000),
  //       batchId,
  //     },
  //   ];

  //   if (new Date(request.startDate).getTime() > new Date().getTime() + 48 * 60 * 60 * 1000) {
  //     // [TWO DAYS LEFT]
  //     message.push({
  //       from: {
  //         name: constants.fromname,
  //         email: await config.sendEmailFrom,
  //       },
  //       to: to,
  //       template_id: constants.templateIds.PROPERTY_COMING_2_DAYS,
  //       dynamic_template_data: request ? request : {},
  //       sendAt: parseInt((new Date(request.startDate).getTime() - 48 * 60 * 60 * 1000) / 1000),
  //       batchId,
  //     });
  //   }

  //   if (new Date(request.startDate).getTime() > new Date().getTime() + 24 * 60 * 60 * 1000) {
  //     message.push(
  //       // [TOMORROW]
  //       {
  //         from: {
  //           name: constants.fromname,
  //           email: await config.sendEmailFrom,
  //         },
  //         to: to,
  //         template_id: constants.templateIds.PROPERTY_LAUNCHING_TOMORROW,
  //         dynamic_template_data: request ? request : {},
  //         sendAt: parseInt((new Date(request.startDate).getTime() - 24 * 60 * 60 * 1000) / 1000),
  //         batchId,
  //       }
  //     );
  //   }
  // } else {
  if (type === constants.templateIds.PROPERTY_SOLD_90_PERCENT || type === constants.templateIds.PROPERTY_SOLD_OUT) {
    const userEmails = userModel.find({}).project({ email: 1 });
    to = await userEmails.toArray();
    to = to.map((item) => item.email);
  }
  message = {
    from: {
      name: constants.fromname,
      email: await config.sendEmailFrom,
    },
    to: to,
    template_id: constants.templateIds[`${type}`],
    dynamic_template_data: request ? { ...request, supportEmail:await config.supportEmail} : {supportEmail:await config.supportEmail},
  };
  // }
  console.log(constants.templateIds[`${type}`]);
  const sgMail = await clientMail
    .sendMultiple(message)
    .then(() => logger.info('Mail sent successfully'))
    .catch((error) => {
      console.log(JSON.stringify(error));
      logger.error(error.message);
      error = error.response.body.errors[0].message ?? error.message;
    });
  console.log(JSON.stringify(sgMail))
  if (sgMail?.error) {
    return { error: sgMail.error };
  }
  return true;
};
