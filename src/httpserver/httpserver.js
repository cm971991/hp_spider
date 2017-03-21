/**
 * Created by hale on 2017/3/6.
 */
let express = require('express');
let hupu = require('../apis/hupu_api');
let router = require('../router/router');
let config = require('../common/config');

let run = function () {
  let app = express();
  app.get(router.hupu.getList + ':id', function (req, res) {
    hupu.getList(req, res);
  });
  
  app.listen(config.port, function () {
    console.log('[HttpServer][Start]', 'runing at http://' + config.ip + ':' + config.port + '');
  })
};

exports.run = run;