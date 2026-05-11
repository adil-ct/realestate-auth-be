import Joi from 'joi';

export const sendingEmailRequest = async (data) => {
  const Schema = Joi.object({
    type: Joi.string().required(),
    email: Joi.required(),
    token: Joi.string().optional(),
    temporaryPassword: Joi.string().optional(),
    request: Joi.object().optional(),
  });

  const validate = Schema.validate(data);
  let error = false;
  let message = '';

  if (validate.error) {
    message = validate.error.details[0].message;
    message = message.replace(/"/g, '');
    error = true;
  }
  return { error, message };
};
