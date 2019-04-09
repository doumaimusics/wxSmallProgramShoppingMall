var WXBizDataCrypt = require('../../../utils/RdWXBizDataCrypt.js');
var app = getApp();
Page({
  data: {
    nullHouse: true,
    house: true,
    lNull: true,
    off: true,
    isLogon: false,
    orderTypeNums: ""
  },
  globalData: {
    appid: app.setting.appid,
    secret: app.setting.secret,
  },
  onLoad: function () {
    var that = this;
    this.getTypeNums()
    wx.getSystemInfo({
      success: function (info) {
        that.data.windowHeight = info.windowHeight;
        that.setData(that.data);
      }
    });
    var AccountTokenGet = wx.getStorageSync('AccountTokenGet');
    // 如果token为空或者为老数据测清除并重新登录
    if (AccountTokenGet.userToken == undefined || AccountTokenGet.userToken == 'undefined' || AccountTokenGet.userToken.tokenType == undefined || AccountTokenGet.userToken.accessToken == undefined || app.utils.isEmpty(AccountTokenGet)) {
      //此时清空storage
      wx.clearStorageSync();
      //重新登录
      app.appLoginFun();
    }
    // 已经登录
    if (!app.utils.isEmpty(AccountTokenGet)) {
      var weixinUserInfo = wx.getStorageSync('weixinUserInfo');
      that.data.weixinUserInfo = weixinUserInfo;
      that.data.isLogon = true;
      that.setData(that.data);
    } else {
      var weixinUserInfo = {
        avatarUrl: '../../../resources/imgs/img_map.png',
        city: '',
        country: '',
        gender: '',
        language: '',
        nickName: '登录',
        province: ''
      };
      that.data.weixinUserInfo = weixinUserInfo;
      that.setData(that.data);
    }
  },
  onShow: function () {
    var AccountTokenGet = wx.getStorageSync('AccountTokenGet');
    if (app.utils.isEmpty(AccountTokenGet)) {
      app.appLoginFun();
    } else {
      if (AccountTokenGet.userToken == undefined || AccountTokenGet.userToken == 'undefined' || AccountTokenGet.userToken.tokenType == undefined || AccountTokenGet.userToken.accessToken == undefined) {
        //此时清空storage
        wx.clearStorageSync();
      }
    }
    setTimeout(() => {
      var weixinUserInfo = wx.getStorageSync('weixinUserInfo');
      if (weixinUserInfo != '') {
        this.setData({
          weixinUserInfo: weixinUserInfo
        })
      }
    }, 2000)
    this.setData({
      off: true
    })
  },
  getTypeNums() {
    var that = this
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.GetTypeNum,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': token,
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res)
        that.setData({
          orderTypeNums: res.data.data
        })
      }
    })
  },
  onPullDownRefresh() {
    this.getTypeNums()
    wx.stopPullDownRefresh()
  },
  /**
   * 
   */
  userInfoHandler: function (e) {
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    var FunId = e.currentTarget.id;
    var activeIndex = e.currentTarget.dataset.index
    var AccountTokenGet = wx.getStorageSync('AccountTokenGet');
    if (!app.utils.isEmpty(AccountTokenGet)) {
      wx.hideLoading();
      // 如果已经登录过直接走方法
      switch (FunId) {
        case "0":
          wx.makePhoneCall({
            phoneNumber: '400-838-8931'
          })
          break;
        case "1":
          var userId = wx.getStorageSync("userId");
          app.GetPhoneNoFun(userId).then(data => {
            if (data == '已绑定') {
              wx.navigateTo({
                url: '../3Dclay/3Dclay',
              })
            } else {
              var weixinUserInfo = wx.getStorageSync("weixinUserInfo");
              wx.navigateTo({
                url: '../../info/register/register?userId=' + userId + '&unionid='
                  + weixinUserInfo.unionid + '&openId=' + weixinUserInfo.openid + '&sqlid=' + '' + '&deviceid=' + '' + '&isQRCodeLogin=' + false + '&back=3Dclay'
              })
            }
          });
          break;
        case "2":
          wx.navigateTo({
            url: '../../info/shoppingCart/shoppingCart',
          })
          break;
        case "3":
          wx.navigateTo({
            url: '../myOrder/myOrder?index=' + activeIndex,
          })
          break;
        case "4":
          wx.navigateTo({
            url: '../address/address',
          })
          break;
        case "5":
          var off = this.data.off;
          if (off) {
            wx.navigateTo({
              url: '../aboutUs/aboutUs'
            })
            this.setData({
              off: false
            })
          }
          break;
      }
    } else {
      wx.login({
        success: res => {
          let jscode = res.code;
          var openIdUrl = app.urls.getOpenId + "?Code=" + res.code;
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
              if (res.data.code == '0') {
                var obj = {};
                obj.openid = res.data.data.openid;
                var pc = new WXBizDataCrypt(app.globalData.AppId, res.data.data.session_key)
                var datail = e.detail;
                console.log(datail.errMsg);
                if (datail.errMsg == 'getUserInfo:fail auth deny' || datail.errMsg == 'getUserInfo:fail auth cancel') {
                  wx.hideLoading();
                  wx.showToast({
                    title: '授权失败！',
                    icon: 'none',
                    duration: 1500
                  })
                  return;
                }
                var data = pc.decryptData(datail.encryptedData, datail.iv)
                console.log('解密后 data: ', data)
                if (data == undefined || data == 'undefined' || data.unionId == undefined || data.unionId == 'undefined') {
                  // 获取用户信息
                  wx.getUserInfo({
                    success: function (info) {
                      console.log(info);
                      var data = pc.decryptData(info.encryptedData, info.iv);
                      obj.unionid = data.unionId;
                      obj.gender = data.gender;
                      obj.nickName = data.nickName;
                      obj.avatarUrl = data.avatarUrl;
                      wx.setStorageSync('weixinUserInfo', obj);
                      that.setData({
                        weixinUserInfo: obj,
                      });
                      var obj2 = {
                        UnionId: obj.unionid,
                        OpenId: obj.openid,
                        Sex: String(obj.gender),
                        NickName: obj.nickName,
                        Avatar: obj.avatarUrl
                      }
                      that.loginFun(obj2, FunId);
                    },
                    fail: function () {
                      wx.hideLoading();
                    }
                  })
                } else {
                  obj.unionid = data.unionId;
                  obj.gender = data.gender;
                  obj.nickName = data.nickName;
                  obj.avatarUrl = data.avatarUrl;
                  wx.setStorageSync('weixinUserInfo', obj);
                  that.setData({
                    weixinUserInfo: obj,
                  });
                }
                var obj2 = {
                  UnionId: obj.unionid,
                  OpenId: obj.openid,
                  Sex: String(obj.gender),
                  NickName: obj.nickName,
                  Avatar: obj.avatarUrl
                }
                that.loginFun(obj2, FunId);
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 1500
                })
              }
            },
            fail: function () {
              wx.showToast({
                title: '获取用户失败！',
                icon: 'none',
                duration: 1000
              })
            }
          });
        },
        fail: res => {
          wx.showToast({
            title: '微信登录失败！',
            icon: 'none',
            duration: 1000
          })
        }
      });
    }
  },
  /**
   * 登录
   */
  loginFun: function (obj, FunId) {
    var obj = obj;
    // 发送登录请求
    var that = this;
    wx.request({
      url: app.urls.userLogin,
      method: 'POST',
      data: obj,
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res);
        wx.hideLoading();
        //判断是否绑定手机号
        if (res.data.code == '0' || res.data.code == '2') {// 已经绑定 //code=2，就是手机号为空
          var user_id = res.data.data.userId;
          wx.setStorageSync('userId', user_id);
          // 获取token
          wx.request({
            url: app.urls.AccountTokenGet + '?UnionId=' + obj.UnionId,
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
                that.setData({
                  isLogon: true
                })
                if (!app.utils.isEmpty(res.data.data.userId)) {
                  switch (FunId) {
                    case "0":
                      break;
                    case "1":
                      var userId = wx.getStorageSync("userId");
                      app.GetPhoneNoFun(userId).then(data => {
                        if (data == '已绑定') {
                          wx.navigateTo({
                            url: '../3Dclay/3Dclay',
                          })
                        } else {
                          var weixinUserInfo = wx.getStorageSync("weixinUserInfo");
                          wx.navigateTo({
                            url: '../../info/register/register?userId=' + userId + '&unionid='
                              + weixinUserInfo.unionid + '&openId=' + weixinUserInfo.openid + '&sqlid=' + '' + '&deviceid=' + '' + '&isQRCodeLogin=' + false + '&back=3Dclay'
                          })
                        }
                      });
                      break;
                    case "2":
                      wx.navigateTo({
                        url: '../../info/shoppingCart/shoppingCart',
                      })
                      break;
                    case "3":
                      wx.navigateTo({
                        url: '../myOrder/myOrder',
                      })
                      break;
                    case "4":
                      wx.navigateTo({
                        url: '../address/address',
                      })
                      break;
                  }
                }
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
                title: 'Token获取失败！',
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
          title: '登录失败！',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  /**
   * 3D人体参数
   */
  openClay: function () {
    this.setData({
      off: true
    })
    var off = this.data.off;
    if (off) {
      wx.navigateTo({
        url: '../3Dclay/3Dclay',
      })
      this.setData({
        off: false
      })
    }
  },
  /**
   * 购物车
   */
  shoppingCart: function (e) {
    this.setData({
      off: true
    })
    var off = this.data.off;
    if (off) {
      wx.navigateTo({
        url: '../../info/shoppingCart/shoppingCart',
      })
      this.setData({
        off: false
      })
    }
  },
  /**
   * 我的订单
   */
  myOrder: function (e) {
    this.setData({
      off: true
    })
    var off = this.data.off;
    if (off) {
      wx.navigateTo({
        url: '../myOrder/myOrder',
      })
      this.setData({
        off: false
      })
    }
  },
  /**
   * 地址管理
   */
  address: function (e) {
    var off = this.data.off;
    if (off) {
      wx.navigateTo({
        url: '../address/address',
      })
      this.setData({
        off: false
      })
    }
  },
  /**
   * 联系我们
   */
  makeCall: function () {
    wx.makePhoneCall({
      phoneNumber: '400-838-8931'
    })
  },
  /**
   *  关于我们
   */
  openAboutUs: function () {
    var off = this.data.off;
    if (off) {
      wx.navigateTo({
        url: '../aboutUs/aboutUs'
      })
      this.setData({
        off: false
      })
    }
  },

  hide: function () {
    var that = this;
    that.setData({
      lNull: true,
      house: true
    })
  },
  show: function () {
    var that = this;
    that.setData({
      lNull: false, //弹窗显示
      house: false
    })
  },
  ok: function () {
    var that = this;
    that.setData({
      lNull: true,
      house: true
    })
  },
});
