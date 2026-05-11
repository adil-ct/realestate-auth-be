import moment from 'moment';

const dateFormats = {
  getCurrentDateTime: () => moment().utc().toDate(),
  dateToUtc: (date) => moment(date).utc().toDate(),
  emailExpiryTime: (date) => moment(date).add(15, 'minutes').utc().toDate(),
};

export default dateFormats;
