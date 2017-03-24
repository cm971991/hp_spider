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
    console.log("[Params]:", param);
    
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
  
  /**
   *
   * @param context
   */
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
          .then(function ($) {
            let $articleElement = $('section .detail-content');
            let header = $articleElement.find('.artical-title').find('h1').text();
            let articleImg = $articleElement.find('.article-content').find('img').attr('src');
            
            let articleContent = [];
            let articleContentElement = $articleElement.find('.article-content').find('p');
            articleContentElement.each(function (index, element) {
              articleContent.push($(element).text());
            });
            
            let $replyElement = $('section .m-reply');
            if ($replyElement && $replyElement.length >= 1) {
              let $brightElement = $replyElement.find('.bright-reply');
              
            }
            
            item.article = new _this.article(header, articleImg, articleContent);
          })
          .catch(function (err) {
            console.log('err:', err);
          });
      }
    })
  },
  
  list: [],
  brightReplyList: [],
  newestReplyList: [],
  result: {},
  
  /**
   * 新闻整体对象
   * @param list 新闻列表
   * @param paging  分页
   */
  newsObject: function (list, paging) {
    this.list = list;
    this.paging = paging;
  },
  
  /**
   * 新闻列表
   * @param title   新闻标题
   * @param link    新闻链接
   * @param id      新闻id
   * @param time    新闻发表时间
   * @param source  新闻来源
   * @param article 新闻
   */
  newsList: function (title, link, id, time, source, article) {
    this.title = title;
    this.link = link;
    this.id = id;
    this.time = time;
    this.source = source;
    this.article = article;
  },
  
  /**
   * 新闻详情
   * @param header  详情标题
   * @param image   详情图片
   * @param content 详情内
   */
  article: function (header, image, content, brightReply, newestReply) {
    this.header = header;
    this.image = image;
    this.content = content;
    this.brightReply = brightReply;
    this.newestReply = newestReply;
  },
  
  /**
   * 亮评对象
   * @param userName      用户名
   * @param time          评论发表时间
   * @param brightNumber  亮了个数
   * @param content       评论内容
   */
  brightReply: function (userName, time, brightNumber, content) {
    this.userName = userName;
    this.time = time;
    this.brightNumber = brightNumber;
    this.content = content;
  },
  
  /**
   * 最新评论对象
   * @param userName      用户名
   * @param time          评论发表时间
   * @param brightNumber  亮了个数
   * @param content       评论内容
   */
  newestReply: function (userName, time, brightNumber, content) {
    this.userName = userName;
    this.time = time;
    this.brightNumber = brightNumber;
    this.content = content;
  },
  
  /**
   * 分页对象
   * @param home      首页
   * @param previous  上一页
   * @param next      下一页
   * @param last      末页
   */
  paging: function (home, previous, next, last) {
    this.homePage = home;
    this.previousPage = previous;
    this.nextPage = next;
    this.lastPage = last;
  },
  
};

module.exports = hupu_service;

