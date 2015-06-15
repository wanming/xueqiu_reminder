#!/usr/bin/env node

var _ = require('lodash');
var request = require('request').defaults({jar: true});
var CronJob = require('cron').CronJob;
var settings = require('./config.example');
var email   = require("emailjs/email");
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var moment = require('moment-timezone');

try {
  settings = require('./config');
} catch (ex) {
  console.warn('no config.js found.');
}

var slice = [].slice;
var now = undefined;

var logPath = path.join(process.env.PWD, settings.log);
var emailSender = email.server.connect(settings.sender);
var visited = {};

try {
  main();
} catch (ex) {
  fatalErrorHandle(ex);
  log(ex.stack || ex);
}

function main () {

  var job = new CronJob(
    '*/30 * 9-14 * * 1-5',
    // '*/30 * * * * 1-5', // for test
    doJob,
    function () {},
    true,
    'Asia/Chongqing'
  );
}

function doJob () {
  // return;
  log('job start.');
  settings.stock.forEach(function (item) {
    getRebalancingInfo(item, function (err, data) {
      if (err) {
        fatalErrorHandle(err);
      } else {
        processDataAndSendEmail(data);
      }
    });
  });
}

function processDataAndSendEmail (data, callback) {

  data.list.forEach(function (item) {

    if (+new Date - item.updated_at < 60 * 60 * 1000 && !visited[item.id]) {

      var title = _.template(settings.template.title)({
        stock_name: data.stock_name + ' ' + formatTime(item.updated_at, 'HH:mm')
      });
      var content = _.template(settings.template.content)({
        stock_symbol: data.stock_symbol,
        stock_name: data.stock_name,
        html_url: data.html_url,
        updated_at: formatTime(item.updated_at, 'YYYY-MM-DD HH:mm:ss'),
        list: item.rebalancing_histories
      });

      visited[item.id] = true;

      log('send email', title);

      sendEmail(settings.email, title, content, function (err, message) {
        if (err) { fatalErrorHandle(err); }
      });
    } else {
      log('ignore');
    }
  });
}

function getRebalancingInfo (stock, callback) {

  log('fetch stock', stock, 'data');

  var htmlUrl = settings.url.base.replace('{stock}', stock);
  var url = settings.url.json.replace('{stock}', stock);
  var stockName = 'unknown';
  var stockNameReg = /<title>(.*?)\s.*<\/title>/;

  request(htmlUrl, function (error, response, body) {

    if (!error && response.statusCode == 200) {

      var matches = body.match(stockNameReg);

      if (matches.length === 2) {
        stockName = matches[1];
      }

      request(url, function (error, response, body) {

        if (!error && response.statusCode == 200) {
          
          var ret = {};
          try { ret = JSON.parse(body); } catch (ex) {}

          ret.stock_symbol = stock;
          ret.stock_name = stockName;
          ret.html_url = htmlUrl;
          callback(null, ret);
        } else {

          callback(error || response);
        }
      });
    } else {

      callback(error || response);
    }
  });
}

function sendEmail (address, title, content, callback) {
  emailSender.send({
    text:    content,
    from:    settings.sender.user, 
    to:      address.join(','),
    // cc:      "else <else@your-email.com>",
    subject: title,
    attachment: [
      {
        data: content,
        alternative: true
      }
    ]
  }, callback);
}

var lastSendErrorEmailTime;

function fatalErrorHandle (err) {

  error(JSON.stringify(err.stack || err));

  if (!lastSendErrorEmailTime || +new Date - lastSendErrorEmailTime > 20 * 60 * 1000) {

    sendEmail([ settings.errorEmail ], 'FETCH_XQ_DATA_ERROR.', 'RT');
    lastSendErrorEmailTime = +new Date;
  }
}

function konsole (prefix, style) {

  prefix = prefix || '';

  var args = slice.call(arguments, 2);

  var content = prefix + args.join(' ');

  fs.appendFileSync(logPath, '[' + formatTime(now, 'YYYY-MM-DD HH:mm:ss') + '] ' + content + '\n');

  console.log.call(null, style ? style(content) : content);
}

function log () {
  konsole.apply(null, [null, null].concat(slice.apply(arguments)));
}

function warn () {
  konsole.apply(null, ['WARNING:', chalk.yellow].concat(slice.apply(arguments)));
}

function error () {
  konsole.apply(null, ['ERROR:', chalk.red].concat(slice.apply(arguments)));
}

function formatTime (time, format) {
  return moment(time).tz('Asia/Shanghai').format(format);
}