//utils
var base64 = require("utils/base64.js");
var md5 = require("utils/md5.js");
var creatUIID = require("utils/base64.modified.js");
var CryptoJS = require("utils/crypto-js.js");
var WXBizDataCrypt = require('utils/RdWXBizDataCrypt.js');
var AppId = 'wxa91720b305cea227';
var AppSecret = 'adc50c00ba30e55a52898d302442cd46';
//var baseurlxcxapi = 'https://test.3dculab.com/NewApi';// 新版API 
var baseurlxcxapi = 'https://test.3dculab.com/UAV1.7';// 正式版本路径

var header = {};
var global_userid = "";
var dataIsQRCodeLogin = {}

var mta = require('./utils/mta_analysis.js')//统计数据sdk

App({
  //当小程序初始化完成时，会触发onLaunch（全局只触发一次）
  onLaunch: function () {
    mta.App.init({
      "appID": "500672284",
      "eventID": "500672288",
      "statShareApp": true
      // "eventID":"500015824", // 高级功能-自定义事件统计ID，配置开通后在初始化处填写
      // "lauchOpts":options, //渠道分析,需在onLaunch方法传入options,如onLaunch:function(options){...}
      // "statPullDownFresh":true, // 使用分析-下拉刷新次数/人数，必须先开通自定义事件，并配置了合法的eventID
      // "statShareApp":true, // 使用分析-分享次数/人数，必须先开通自定义事件，并配置了合法的eventID
      // "statReachBottom":true // 使用分析-页面触底次数/人数，必须先开通自定义事件，并配置了合法的eventID
    });


    // if (wx.canIUse('getUpdateManager')) { // 基础库 1.9.90 开始支持，低版本需做兼容处理
    //   const updateManager = wx.getUpdateManager();
    //   updateManager.onCheckForUpdate(function (result) {
    //     if (result.hasUpdate) { // 有新版本
    //       updateManager.onUpdateReady(function () { // 新的版本已经下载好
    //         wx.showModal({
    //           title: '更新提示',
    //           content: '新版本已经下载好，请重启应用。',
    //           success: function (result) {
    //             if (result.confirm) { // 点击确定，调用 applyUpdate 应用新版本并重启
    //               updateManager.applyUpdate();
    //             }
    //           }
    //         });
    //       });
    //       updateManager.onUpdateFailed(function () { // 新的版本下载失败
    //         wx.showModal({
    //           title: '已经有新版本了哟~',
    //           content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
    //         });
    //       });
    //     }
    //   });
    // } else { // 有更新肯定要用户使用新版本，对不支持的低版本客户端提示
    //   wx.showModal({
    //     title: '温馨提示',
    //     content: '当前微信版本过低，无法使用该应用，请升级到最新微信版本后重试。'
    //   });
    // }
  },
  //当小程序启动，或从后台进入前台显示，会触发onShow
  onShow: function (options) {
    var that = this;
    // 扫码登录
    if (options.scene == 1011 || options.scene == 1025) {
      that.globalData.scene = "scan"; //扫码进入
    }
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    if (AccessTokey) {
      if (AccessTokey.userToken == undefined || AccessTokey.userToken == 'undefined' || AccessTokey.userToken.tokenType == undefined || AccessTokey.userToken.accessToken == undefined) {
        //此时清空storage
        wx.clearStorageSync();
      }
    }
  },
  globalData: {
    userInfo: null,
    RequestTask: null,
    AppId: 'wxa91720b305cea227',
    scene: 'scan'
  },
  //全局配置
  setting: {
    logHttpHeader: false,//是否打印每次请求的header
    logHttpData: true,//是否打印每次请求的原始数据
    logHttpUrl: true,//是否打印每次请求的url
    logHttpResponse: true,//是否打印每次请求成功后的返回结果
    // tabBarHeight: 1000,//底部tabBar的高度，单位rpx
    useless: true,//一个没有实际意义的占位字段
    debug: true,
    appid: 'wxa91720b305cea227',
    secret: 'adc50c00ba30e55a52898d302442cd46',
  },
  createSignedHeader: function (base64Data) {
    var tempHeader = {};
    for (var key in this.defaultHeader) {
      tempHeader[key] = this.defaultHeader[key];
    }
    var now = "" + new Date().getTime();
    tempHeader["M-TIME"] = now;
    var str = now + this.key;
    if (base64Data) {
      str += base64Data;
    }
    tempHeader["M-SIGN"] = md5.hexMd5(str);
    // tempHeader["X-CITYID"] = '9';
    var XUUID = creatUIID.encode("微信");
    tempHeader["X-UUID"] = XUUID;
    return tempHeader;
  },
  /**
   * 显示授权对话框
   */
  showPermissions: function (permissions) {
    wx.showModal({
      title: '用户未授权',
      content: '如需正常使用小程序功能，请按确定并且在【我的】页面中点击授权按钮，勾选用户信息并点击确定。',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          wx.openSetting({
            success: function (res) {
              console.log("openSetting " + permissions);
            }
          })
        }
      }
    })
  },

  urls: {
    GetPromotionsSmallBannerList: baseurlxcxapi + "/api/Activity/GetBanners",//获取Banner列表
    getStoreList: baseurlxcxapi + "/api/Store/GetStoreList", //获取店铺列表
    // getProductList: baseurlxcxapi + "/api/Activity/GetProd",//获取产品列表
    getProductList: baseurlxcxapi + "/api/Activity/GetProducts",//获取产品列表
    GetPromotionsIndexPicUAByID: baseurlxcxapi + "/api/Activity/GetPromotions",//获取首页的所有活动
    getProductDetail: baseurlxcxapi + "/api/Activity/GetProductDetail",//获取产品明细
    getCategoryList: baseurlxcxapi + '/api/Activity/GetActivities',//获取首页推送的商品信息

    searchProductList: baseurlxcxapi + '/api/Search/GetSearchResult',//搜索结果

    goodsAdd: baseurlxcxapi + "/api/Cart/Add",//添加购物车 
    getList: baseurlxcxapi + "/api/Cart/GetList",//获取购物车列表
    getProductCount: baseurlxcxapi + "/api/Cart/GetCount",//获取购车数量
    goodsDelete: baseurlxcxapi + "/api/Cart/Delete",//删除购物车商品
    GoodsEdit: baseurlxcxapi + "/api/Cart/Edit",// 购物车编辑

    orderTempAdd: baseurlxcxapi + "/api/Order/CreateTempOrder",//创建临时订单
    orderTempGetOne: baseurlxcxapi + "/api/Order/GetTempOrderById",//获取临时订单详情
    CalculateFreight: baseurlxcxapi + "/api/Order/ChangeAddress",//用户修改了地址则重新获取详情信息
    OrderUpdataPayType: baseurlxcxapi + "/api/Pay/ChangePayType",//修改支付方式

    orderAdd: baseurlxcxapi + "/api/Order/CreateOrder",//创建正式订单
    wxPayment: baseurlxcxapi + "/api/Pay/GetWxPayParam",//发起支付
    orderGetListCom: baseurlxcxapi + "/api/Order/GetOrderList",//获取用户订单列表
    orderCancel: baseurlxcxapi + "/api/Order/Cancel",//取消订单
    orderGetDetailById: baseurlxcxapi + "/api/Order/GetOrderById",//获取订单详情
    GetOrderInvoice: baseurlxcxapi + "/api/Order/GetOrderInvoice",//根据订单号获取开票信息
    ConfirmReceipt: baseurlxcxapi + '/api/Order/ConfirmReceipt',// 确认收货
    UseCouponCode: baseurlxcxapi + '/api/Order/UseCouponCode',// 使用优惠码
    Returns: baseurlxcxapi + '/api/Order/Returns', //申请退换退款
    Upload: baseurlxcxapi + '/api/Order/Upload', //图片上传Order/Upload
    FillExpress: baseurlxcxapi + '/api/Order/FillExpress', //补充物流信息

    getAddressList: baseurlxcxapi + "/api/Address/GetList",//获取地址列表
    addressCreate: baseurlxcxapi + "/api/Address/Add",//添加地址
    addressUpdate: baseurlxcxapi + "/api/Address/Edit",//修改地址
    addressDelete: baseurlxcxapi + "/api/Address/Delete",//删除地址

    getOpenId: baseurlxcxapi + "/api/Account/GetOpenId",//获取用户openID
    userLogin: baseurlxcxapi + "/api/Account/Login",  //获取用户登录userID
    AccountTokenGet: baseurlxcxapi + "/api/Account/GetApiToken",  //登录之后调用获取token

    GetCheckNum: baseurlxcxapi + "/api/Account/GetValidCode",  //登录之后调用获取验证码
    CheckCode: baseurlxcxapi + "/api/Account/CheckValidCode",  //登录之后调用检验验证码
    GetPhoneNo: baseurlxcxapi + "/api/Account/GetPhoneNo",  //获取手机号

    ScanLogin: baseurlxcxapi + "/api/Account/LoginByPad",//扫码登录

    UserBodyInfo: baseurlxcxapi + "/api/Threed/GetBodyData",//获取3d人体身体参数
    UserFoot: baseurlxcxapi + "/api/Threed/GetFootData",//获取3d人体足型参数
    GetSendBackInfo: baseurlxcxapi + "/api/Order/GetSendBackInfo",//寄出的收货信息后
    GetTypeNum: baseurlxcxapi + "/api/order/GetOrderCount",//获取订单状态数量
    apiImgUrl: "http://api2.3dculab.com/api/Files/DownFileById?id=",
    getCategory:baseurlxcxapi + "/api/Activity/GetCategoryTree",//获取分类树结构
    getShareCode:baseurlxcxapi +"/api/Activity/GetProductQrCode"//获取详情页面分享二维码
  },
  /**
   * 登录方法
   */
  appLoginFun: function () {
    var appthis = this;// 指当前页面
    wx.showLoading({
      title: '加载中',
    });
    wx.login({
      success: function (res) {
        //code不为空时获取必要信息
        if (!appthis.utils.isEmpty(res.code)) {
          var openIdUrl = appthis.urls.getOpenId + "?Code=" + res.code;
          wx.request({
            url: openIdUrl,
            method: 'get',
            header: {
              'content-type': 'application/json', // 默认值
              'Channel': 'UA',
              'CallSource': 'XCX',
              'DeviceCode': '',
            },
            success: function (res) {
              // console.log("获取到openid的返回结果:" + JSON.stringify(res));
              if (res.data.code == '0') {
                var obj = {};
                obj.openid = res.data.data.openid;
                obj.unionid = res.data.data.unionid;
                obj.expires_in = Date.now() + res.data.data.expires_in;
                var pc = new WXBizDataCrypt(appthis.globalData.AppId, res.data.data.session_key);
                // 判断是否已经授过权限
                wx.getSetting({
                  success: function (res) {
                    // console.log('是否授权：' + res.authSetting['scope.userInfo'])
                    if (res.authSetting['scope.userInfo']) {
                      // 获取用户信息
                      wx.getUserInfo({
                        success: function (res) {
                          var data = pc.decryptData(res.encryptedData, res.iv)
                          obj.unionid = data.unionId;
                          obj.gender = data.gender;
                          obj.nickName = data.nickName;
                          obj.avatarUrl = data.avatarUrl;
                          wx.setStorageSync('weixinUserInfo', obj);
                          //获取userid
                          var openid = obj.openid;
                          var unionid = obj.unionid;
                          var sex = String(obj.gender);
                          var nickname = obj.nickName;
                          var headimgurl = obj.avatarUrl;
                          var obj2 = {
                            UnionId: unionid,
                            OpenId: openid,
                            Sex: sex,
                            NickName: nickname,
                            Avatar: headimgurl
                          }
                          console.log(obj2);
                          // 发送登录请求
                          wx.request({
                            url: appthis.urls.userLogin,
                            method: 'POST',
                            data: obj2,
                            header: {
                              'content-type': 'application/json', // 默认值
                              'Channel': 'UA',
                              'CallSource': 'XCX',
                              'DeviceCode': '',
                            },
                            success: function (res) {
                              wx.hideLoading();
                              var user_id = res.data.data.userId;
                              //不判断是否绑定手机号
                              if (res.data.code == '0' || res.data.code == '2') {
                                wx.setStorageSync('userId', user_id);
                                // 获取token
                                wx.request({
                                  url: appthis.urls.AccountTokenGet + '?Unionid=' + unionid,
                                  method: 'get',
                                  header: {
                                    'content-type': 'application/json', // 默认值
                                    'Channel': 'UA',
                                    'CallSource': 'XCX',
                                    'DeviceCode': '',
                                  },
                                  success: function (res) {
                                    if (res.data.code == '0') {
                                      wx.setStorageSync('AccountTokenGet', res.data.data);
                                    } else {
                                      wx.showToast({
                                        title: res.data.message,
                                        icon: 'none',
                                        duration: 1000
                                      })
                                    }
                                  },
                                  fail: function () {
                                    wx.hideLoading();
                                    wx.showToast({
                                      title: '获取Token失败！',
                                      icon: 'none',
                                      duration: 1000
                                    })
                                  }
                                })
                              }
                              else {
                                wx.showToast({
                                  title: res.data.message,
                                  icon: 'none',
                                  duration: 2000
                                })
                              }

                            },
                            fail: function () {
                              wx.hideLoading();
                              wx.showToast({
                                title: '微信登录失败！',
                                icon: 'none',
                                duration: 1000
                              })
                            }
                          })
                        },
                        fail: function (res3) {
                          wx.hideLoading();
                        }
                      })
                    } else {
                      wx.hideLoading();
                    }
                  }
                })
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 1500
                })
              }
            },
            fail: function () {
              wx.hideLoading();
              wx.showToast({
                title: '获取openId失败！',
                icon: 'none',
                duration: 1000
              })
            }
          });
        }
      },
      fail: function () {
        wx.hideLoading();
        console.log(" wx.login 返回 fail");
        wx.showToast({
          title: '用户登录失败！',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  /**
   * 获取token方法
   */
  funGetToken: function () {
    var appthis = this;
    var weixinUserInfo = wx.getStorageSync("weixinUserInfo");
    wx.request({
      url: appthis.urls.AccountTokenGet + '?Unionid=' + weixinUserInfo.unionid,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        if (res.data.code == '0') {
          wx.setStorageSync('AccountTokenGet', res.data.data);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: 'token获取用户失败！',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  /**
   * 获取用户手机号
   */
  GetPhoneNoFun: function (id) {
    var obj = `?UserId=${id}`
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.urls.GetPhoneNo + obj, //仅为示例，并非真实的接口地址
        method: 'get',
        header: {
          'content-type': 'application/json', // 默认值
          'Channel': 'UA',
          'CallSource': 'XCX',
          'DeviceCode': '',
        },
        success(res) {
          if (res.data.code == 0) {
            if (res.data.data) {
              resolve('已绑定');
            } else {
              resolve('未绑定');
            }
          }
        }
      })
    })

  },
  /**
   * 获得购物车数量方法
   */
  shopNumber: function (This) {
    var that = This;//调用方法的this
    var appthis = this;// 指当前页面
    var userId = wx.getStorageSync('userId')
    //之后登陆之后才可以获取购物车数量
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    if (!appthis.utils.isEmpty(userId) && AccessTokey !== '') {
      if (AccessTokey.userToken == undefined || AccessTokey.userToken == 'undefined' || AccessTokey.userToken.tokenType == undefined || AccessTokey.userToken.accessToken == undefined) {
        //此时清空storage
        wx.clearStorageSync();
      } else {
        var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
        wx.request({
          url: appthis.urls.getProductCount, //仅为示例，并非真实的接口地址
          method: 'get',
          header: {
            'content-type': 'application/json', // 默认值
            'Authorization': token,
            'Channel': 'UA',
            'CallSource': 'XCX',
            'DeviceCode': '',
          },
          success(res) {
            var shopNumber = res.data.data;
            that.data.shopNumber = shopNumber;
            that.data.IsLogin = true;
            that.setData(that.data);
            // that.setData({
            //   IsLogin:true
            // })
            //console.log(that.data);
          },
          fail: function (src) {
            console.log(src);
          }
        })
      }

    }
  },
  /**
   * 删除购物车方法
   */
  remShoppingCartFun: function (obj, str) {
    var app = this;
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.goodsDelete,
      method: 'POST',
      data: JSON.stringify(obj),
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': token,
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        if (res.data.code == '0') {
          if (str == '购物车') {
            wx.showToast({
              title: '删除成功！',
              icon: 'none',
              duration: 3000
            })
          }
        } else {
          if (str == '购物车') {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 3000
            })
          }
        }
      },
      complete: function (com) {
        //token过期
        if (com.statusCode == 401) {
          // 重新获取token
          app.funGetToken();
        }
      }
    })
  },
  //插入 html 转译字符
  htmlEscape: function (html) {
    var reg = '/(&lt;)|(&gt;)|(&amp;)|(&quot;)/g';
    return html.replace(reg, function (match) {
      switch (match) {
        case "&lt;":
          return "<";
        case "&gt;":
          return ">"
        case "&amp;":
          return "&";
        case "&quot;":
          return "\""
      }
    });
  },
  //所有工具类
  utils: {
    base64: base64,
    isPhone: function (str) {
      return str != null && str.match("^1[345789][0-9]{9,9}$") != null;
    },
    notEmpty: function (str) {
      return str != null && str != "" && typeof (str) != 'undefined' && str != 'undefined';
    },
    isEmpty: function (str) {
      return str == null || str == "" || typeof (str) == 'undefined' || str == 'undefined';
    },
    setSignal: function (key, value) {
      if (key == null) {
        return;
      }
      if (value == null) {
        value = true;
      }
      if (this.signal == null) {
        this.signal = {};
      }
      this.signal[key] = value;
    },
    getSignal: function (key) {
      if (this.signal) {
        let signal = this.signal[key];
        if (signal) {
          this.signal[key] = null;
        }
        return signal;
      }
      else {
        return null;
      }
    },
    removeSignal: function (key) {
      if (key == null || this.signal == null) {
        return;
      }
      this.signal[key] = null;
    },
    AES_Encrypt: function (str) {
      var key = CryptoJS.enc.Utf8.parse(")O[NB]6,YF}+efcaj{+oESb9d8>Z'e9M");
      var iv = CryptoJS.enc.Utf8.parse("L+\~f4,Ir)b$=pkf");
      var srcs = CryptoJS.enc.Utf8.parse(str);
      var encrypted = CryptoJS.AES.encrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    },

  },
})