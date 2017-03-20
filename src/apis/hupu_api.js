/**
 * Created by hale on 2017/3/6.
 */

let hupu_service = require('../service/hupu_service');

let hupu = {
  getList: function (req, res) {
    return hupu_service.spider(req, res);
  }
};

module.exports = hupu;