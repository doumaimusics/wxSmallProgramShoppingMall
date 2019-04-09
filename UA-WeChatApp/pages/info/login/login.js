var util = require('../../../utils/util.js');
var WXBizDataCrypt = require('../../../utils/RdWXBizDataCrypt.js');
var app = getApp();
var content;
 Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs: [
      "https://wx.3dculab.com/uaxcxv1.0.1/Content/WelcomeBG.jpg"
    ],
    img: "https://wx.3dculab.com/wxMsgSvr/hellokittyimg/resources/imgs/btn_login.png",
    isShowBtn: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    content = this;   
    console.log('LOGIN');  
    // 判断是否是从TV过来的
    if(options.q !== undefined) {
      var ewm_url = decodeURIComponent(options.q);
      console.log("二维码链接："+ewm_url); //打印出url
      var surls = ewm_url.split("/");//分割网址，提取出参数
      var p = surls[surls.length - 1].split("|");//最后一个是参数
      if (p.length > 1 && p[0] != '' && p[p.length-1] != '') {
        var dataIsQRCodeLogin = {
          sqlid: p[0],
          deviceid: p[p.length - 1],
          isQRCodeLogin: true
        }
        content.setData({
          dataIsQRCodeLogin: dataIsQRCodeLogin
        });
      }else {
        var dataIsQRCodeLogin = {
          sqlid: '',
          deviceid: '',
          isQRCodeLogin: false
        }
        content.setData({
          dataIsQRCodeLogin: dataIsQRCodeLogin
        });
      }
    }else{
      var dataIsQRCodeLogin = {
        sqlid: '',
        deviceid: '',
        isQRCodeLogin: false
      }
      content.setData({
        dataIsQRCodeLogin: dataIsQRCodeLogin
      });
    }
    // 先判断是否是扫码登录
    if (content.data.dataIsQRCodeLogin.isQRCodeLogin){
      // 没有登录清楚本地缓存
      //wx.clearStorage();
    }else{
      //首先判断是否已经登录过了
      var AccessTokey = wx.getStorageSync("AccountTokenGet");
      if (AccessTokey !== "") {
        wx.switchTab({
          url: '../index/index'
        });
        return;
      } else {
        // 没有登录清楚本地缓存
        wx.clearStorage();
      }
    }
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 小程序登录方法
   */
  userInfoHandler: function (e) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    });
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
              var pc = new WXBizDataCrypt(app.globalData.AppId, res.data.data.session_key);
              var datail = e.detail;
              if (datail.errMsg == 'getUserInfo:fail auth deny' || datail.errMsg == 'getUserInfo:fail auth cancel') {
                wx.hideLoading();
                wx.showToast({
                  title: '授权失败！',
                  icon: 'none',
                  duration: 2000
                })
                return;
              }
              var data = pc.decryptData(datail.encryptedData, datail.iv);
              if (data == undefined || data == 'undefined' || data.unionId == undefined || data.unionId == 'undefined') {
                // 获取用户信息
                wx.getUserInfo({
                  success: function (info) {
                    var data = pc.decryptData(info.encryptedData, info.iv);
                    console.log(data);
                    obj.unionid = data.unionId;
                    obj.gender = data.gender;
                    obj.nickName = data.nickName;
                    obj.avatarUrl = data.avatarUrl;
                    if (obj.unionid == undefined || obj.unionid == 'undefined') {
                      wx.hideLoading();
                      wx.showToast({
                        title: '解析数据失败,请重新授权！',
                      })
                      return;
                    }
                    wx.setStorageSync('weixinUserInfo', obj);
                    var obj2 = {
                      UnionId: obj.unionid,
                      OpenId: obj.openid,
                      Sex: obj.gender,
                      NickName: obj.nickName,
                      Avatar: obj.avatarUrl,
                      StoreCode: that.data.dataIsQRCodeLogin.sqlid,
                      DeviceId: that.data.dataIsQRCodeLogin.deviceid,
                      TvLogin: that.data.dataIsQRCodeLogin.isQRCodeLogin
                    }
                    console.log(JSON.stringify(obj2) );
                    that.loginFun(obj2)
                  },
                  fail: function () {
                    wx.hideLoading();
                  }
                })
              }else{
                //console.log('解密后 data: ', data)
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
                // 如果是扫码进入即链接后面有值则isQRCodeLogin为true
                var obj2 = {
                  UnionId: unionid,
                  OpenId: openid,
                  Sex: sex,
                  NickName: nickname,
                  Avatar: headimgurl,
                  StoreCode: that.data.dataIsQRCodeLogin.sqlid,
                  DeviceId: that.data.dataIsQRCodeLogin.deviceid,
                  TvLogin: that.data.dataIsQRCodeLogin.isQRCodeLogin
                }
                console.log(JSON.stringify(obj2));
                that.loginFun(obj2)
              }
            }
          },
          fail: function () {
            wx.hideLoading();
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
  },
  /**
   * 登录接口
   */

  loginFun:function(obj){
    var obj2 = obj;
    var that = this;
    // 发送登录请求
    wx.request({
      url: app.urls.userLogin,
      method: 'POST',
      data: obj2,
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res);
        wx.hideLoading();
        var user_id = res.data.data.userId;
        //判断是否绑定手机号
        if (res.data.code == '0') {// 已经绑定
          wx.setStorageSync('userId', user_id);
          // 获取token
          wx.request({
            url: app.urls.AccountTokenGet + '?Unionid=' + obj2.UnionId,
            method: 'get',
            header: {
              'content-type': 'application/json', // 默认值
              'Channel': 'UA',
              'CallSource': 'XCX',
              'DeviceCode': '',
            },
            success: function (res) {
              console.log(res);
              if (res.data.code == '0') {
                wx.setStorageSync('AccountTokenGet', res.data.data);
                if (!app.utils.isEmpty(res.data.data.userId)) {
                  // 跳转在tabBar 页面
                  wx.switchTab({
                    url: '../index/index'
                  })
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
                title: '获取用户失败！',
                icon: 'none',
                duration: 1000
              })
            }
          })
        } else if (res.data.code == '2') {//没有绑定去注册
          wx.setStorageSync('userId', user_id);
          var weixinUserInfo = wx.getStorageSync('weixinUserInfo');
          wx.navigateTo({
            url: '../register/register?userId=' + user_id + '&unionid=' + weixinUserInfo.unionid + '&openId=' + weixinUserInfo.openid+ '&sqlid=' + that.data.dataIsQRCodeLogin.sqlid + '&deviceid=' + that.data.dataIsQRCodeLogin.deviceid + '&isQRCodeLogin=' + that.data.dataIsQRCodeLogin.isQRCodeLogin + '&back=index'
          })
          return;
        } else {
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
  }
 })