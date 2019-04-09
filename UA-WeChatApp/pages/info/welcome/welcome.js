var util = require('../../../utils/util.js');
var WXBizDataCrypt = require('../../../utils/RdWXBizDataCrypt.js');
var app = getApp();
var content;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    welcomeShow:0,  //1代表登录成功2代表授权失败
    windowHeight:500
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断是否是从TV过来的
    var that = this;
    if (options.q !== undefined) {
      var ewm_url = decodeURIComponent(options.q);
      var surls = ewm_url.split("/");//分割网址，提取出参数
      var p = surls[surls.length - 1].split("|");//最后一个是参数
      if (p.length > 1 && p[0] != '' && p[p.length - 1] != '') {
        that.setData({
          scan: p[0],
          storeID: p[1],
          machineid: p[2],
          times: p[p.length - 1]
        })
        that.loginFun();
      }
    }
    wx.getSystemInfo({
      success(res){
        that.setData({
          windowHeight: res.windowHeight
        })
        console.log(res.windowHeight);
      }
    })
  },
  /**
   * 不点击按钮自动授权
   */
  loginFun:function(){
    var that = this;
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
              wx.getUserInfo({
                success: function (res) {
                  //console.log(res)
                  var data = pc.decryptData(res.encryptedData, res.iv)
                  //console.log('解密后 data: ', data)
                  obj.unionid = data.unionId;
                  obj.gender = data.gender;
                  obj.nickName = data.nickName;
                  obj.avatarUrl = data.avatarUrl;
                  var ScanObj = {
                    UnionId: obj.unionid,
                    OpenId: obj.openid,
                    //Type: that.data.scan,
                    StoreCode: that.data.storeID,
                    DeviceCode: that.data.machineid,
                    TimeStamp: that.data.times
                  }
                  wx.request({
                    url: app.urls.ScanLogin,
                    method: 'POST',
                    data: JSON.stringify(ScanObj),
                    header: {
                      'content-type': 'application/json', // 默认值
                    },
                    success: function (res) {
                    },
                    complete: function (data) {
                      if (data.statusCode == 200) {
                        that.setData({
                          welcomeShow: 1
                        })
                      }
                    },
                    fail: data => {
                      console.log(data)
                    }
                  })
                },
                //当用户未授权过，调用该接口将直接进入fail回调
                fail: function () {
                  that.setData({
                    welcomeShow: 2
                  })
                  // wx.showToast({
                  //   title: '获取用户失败！',
                  //   icon: 'none',
                  //   duration: 1000
                  // })
                }
              })
            }
          },
          fail: function () {
            wx.showToast({
              title: '获取openId失败！',
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
        });
      }
    });
  },
  /**
   * 按钮授权
   */
  bindGetUserInfo:function(e){
    console.log(e)
    var that = this;
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
              var datail=e.detail;
              var data = pc.decryptData(datail.encryptedData, datail.iv)
              //console.log('解密后 data: ', data)
              obj.unionid = data.unionId;
              obj.gender = data.gender;
              obj.nickName = data.nickName;
              obj.avatarUrl = data.avatarUrl;
              var ScanObj = {
                UnionId: obj.unionid,
                OpenId: obj.openid,
                //Type: that.data.scan,
                StoreCode: that.data.storeID,
                DeviceCode: that.data.machineid,
                TimeStamp: that.data.times
              }
              //console.log(ScanObj)
              wx.request({
                url: app.urls.ScanLogin,
                header: {
                  'content-type': 'application/json', // 默认值
                },
                method: 'POST',
                data: JSON.stringify(ScanObj),
                success: function (res) {
                  console.log(res)
                },
                complete: function (data) {
                  if (data.statusCode == 200) {
                    that.setData({
                      welcomeShow: 1
                    })
                  }
                },
                fail: data => {
                  console.log(data)
                }
              })
            }else{
              wx.showToast({
                title: res.data.message,
                icon:'none',
                duration:1500
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
  },
  /**
   * 进入首页
   */
  openIndex:function(){
    wx.switchTab({
      url: '../index/index'
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
})