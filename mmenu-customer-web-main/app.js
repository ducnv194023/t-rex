const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const moment = require('moment');
const cookieSession = require('cookie-session');

const hbs = require('hbs');
const customerRouter = require('./routes/customer');

const app = express();

// hbs helpers

hbs.registerHelper('serialNo', (options) => {
  let currentSerialNo = options.data.root.serialNo;

  if (currentSerialNo === undefined || currentSerialNo === 0) {
    currentSerialNo = 1;
  } else {
    currentSerialNo += 1;
  }

  // eslint-disable-next-line no-param-reassign
  options.data.root.serialNo = currentSerialNo;
  return currentSerialNo;
});

hbs.registerHelper('resetSerialNo', (options) => {
  let currentSerialNo = options.data.root.serialNo;

  currentSerialNo = 0;

  // eslint-disable-next-line no-param-reassign
  options.data.root.serialNo = currentSerialNo;
});

hbs.registerHelper('setVar', (varName, varValue, options) => {
  // eslint-disable-next-line no-param-reassign
  options.data.root[varName] = varValue;
});

hbs.registerHelper('getOrderedQuantity', (dishId, options) => {
  const { cartItems } = options.data.root.cart;

  const orderedDish = cartItems.filter((element) => element.dishId.id === dishId);

  if (orderedDish.length === 0) {
    return 0;
  }
  return orderedDish[0].quantity;
});

hbs.registerHelper('equals', (a, b, options) => ((a === b) ? options.fn(this) : options.inverse(this)));

hbs.registerHelper('getTotalQuantity', (options) => {
  const { cartItems } = options.data.root.cart;
  return cartItems.length;
});

// used in bill.hbs to get the bill created time
hbs.registerHelper('timeConverter', (createdAt) => {
  const time = new Date(createdAt);
  const dateString = moment.utc(time);
  const localDateString = moment(dateString).format('h:mA DD/MM/YYYY');
  return localDateString;
});

hbs.registerHelper('userName', (options) => {
  const userInfo = options.data.root.bill.orderDetails[0].userId;

  if (userInfo.isAnonymous) {
    return 'Anonymous';
  }
  return '';
});

hbs.registerHelper('paymentMethod', (options) => {
  const method = options.data.root.bill.paymentMethod;
  if (method === 'CASH') {
    return 'Tiền mặt';
  }
  return 'chua';
});

hbs.registerHelper('thousandFormatter', (num) => {
  if(!num) return '0';
  return num.toLocaleString();
});

hbs.registerHelper('json', (context) => JSON.stringify(context).replace(/"/g, '&quot;'));

app.use(cookieSession({
  name: 'session',
  keys: ['token', 'userId'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/customer', customerRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
