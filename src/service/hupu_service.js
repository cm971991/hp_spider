/**
 * Created by hale on 2017/3/20.
 */

let rp      = require('request-promise'),
    cheerio = require('cheerio'),
    config  = require('../common/config');

let hupu_service = {
  
  spider: function (req, res) {
    let _this = this;
    let param = req.params.id;
    console.log("[Params]:", param)
    
    let options = {
      url: config.spiderUrl + param,
      transform: function (body) {
        return cheerio.load(body);
      }
    };
    
    rp(options)
      .then(function ($) {
        _this.analyseHomePage($);
        _this.analyseItemPage(_this);
      })
      .catch(function (err) {
        console.log('err:', err);
      });
    
    let c = setInterval(function () {
      if (_this.result && _this.result.list && _this.result.list[19].article.header) {
        console.log("_this.result.list.length:", _this.result.list.length)
        clearInterval(c);
        let body = JSON.stringify(_this.result);
        res.send(body);
      }
    }, 500);
  },
  
  analyseHomePage: function ($) {
    let _this = this;
    let $parentElement = $('.news-list ul li a');
    _this.list = [];
    $parentElement.each(function (index, element) {
      let $contentElement = $(element).find('.news-wrap').find('.news-txt');
      let $sourceElement = $($contentElement).find('.news-status-bar').find('.news-info');
      
      let pageName = $(element).attr('href');
      let link = 'https:' + pageName;
      let id = pageName.substring(pageName.lastIndexOf('/') + 1, pageName.length).split('.')[0];
      let title = $($contentElement).find('h3').text();
      let source = $($sourceElement).find('.news-source').text();
      let time = $($sourceElement).find('.news-time').text();
      let model = new _this.newsList(title, link, id, time, source, {});
      _this.list.push(model);
    });
    
    let $pagingElement = $('.m-page');
    let homePage = $pagingElement.find('a:first-child').attr('href');
    homePage = homePage.substring(homePage.lastIndexOf('/') + 1, homePage.length);
    let previousPage = $pagingElement.find('a:nth-child(2)').attr('href');
    previousPage = previousPage.substring(previousPage.lastIndexOf('/') + 1, previousPage.length);
    let nextPage = $pagingElement.find('a:nth-child(4)').attr('href');
    nextPage = nextPage.substring(nextPage.lastIndexOf('/') + 1, nextPage.length);
    let lastPage = $pagingElement.find('a:last-child').attr('href');
    lastPage = lastPage.substring(lastPage.lastIndexOf('/') + 1, lastPage.length);
    let paging = new _this.paging(homePage, previousPage, nextPage, lastPage);
    
    _this.result = new _this.newsObject(_this.list, paging);
  },
  
  analyseItemPage: function (context) {
    let _this = context;
    this.list.forEach(function (item, index, array) {
      if (item) {
        let options = {
          url: item.link,
          transform: function (body) {
            return cheerio.load(body);
          }
        };
        
        rp(options)
          .then(function ($, rep) {
            let $articleElement = $('section .detail-content');
            let header = $articleElement.find('.artical-title').find('h1').text();
            let articleImg = $articleElement.find('.article-content').find('img').attr('src');
            
            let articleContent = [];
            let articleContentElement = $articleElement.find('.article-content').find('p');
            articleContentElement.each(function (index, element) {
              articleContent.push($(element).text());
            });
            item.article = new _this.article(header, articleImg, articleContent);
          })
          .catch(function (err) {
            console.log('err:', err);
          });
      }
    })
  },
  
  result: {},
  
  newsObject: function (list, paging) {
    this.list = list;
    this.paging = paging;
  },
  
  list: [],
  
  newsList: function (title, link, id, time, source, article) {
    this.title = title;
    this.link = link;
    this.id = id;
    this.time = time;
    this.source = source;
    this.article = article;
  },
  
  article: function (header, image, content) {
    this.header = header;
    this.image = image;
    this.content = content;
  },
  
  paging: function (home, previous, next, last) {
    this.homePage = home;
    this.previousPage = previous;
    this.nextPage = next;
    this.lastPage = last;
  },
  
};

module.exports = hupu_service;

