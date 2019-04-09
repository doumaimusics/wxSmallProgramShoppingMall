// pages/info/register/register.js
var util = require('../../../utils/util.js');
var WXBizDataCrypt = require('../../../utils/RdWXBizDataCrypt.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img: "https://wx.3dculab.com/uaxcxv1.0.1/Content/WelcomeBG.jpg",
    timer: '',//定时器名字
    phoneCode:'获取验证码',
    flag:false,
    codeDis:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userId = options.userId;
    var unionid = options.unionid;
    var sqlid = options.sqlid;
    var deviceid = options.deviceid;
    var isQRCodeLogin = options.isQRCodeLogin;
    var openId = options.openId;
    var tempOrderId = options.tempOrderId == undefined || options.tempOrderId == 'undefined' ? '' : options.tempOrderId;
    var back = options.back == undefined || options.back == 'undefined' ? '' : options.back
    this.setData({
      userId: userId,
      unionid: unionid,
      sqlid: sqlid,
      deviceid: deviceid,
      isQRCodeLogin: isQRCodeLogin,
      openid: openId,
      back: back,
      tempOrderId: tempOrderId

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 倒计时
  countDown: function () {
    var that = this; 
    that.setData({
      phoneCode: 60
    })
    var phoneCode = that.data.phoneCode;
    that.setData({
      timer: setInterval(function () {
        phoneCode--;

        that.setData({
          phoneCode: phoneCode,
          codeDis:true,
        })
        if (phoneCode == 0) {
          //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，

          clearInterval(that.data.timer);
          that.setData({
            phoneCode: "获取验证码",
            flag: true,
            codeDis: false,
          })
        }
      },1000)
    })
  },

  phone: function (e) {
    this.setData({ phone: e.detail.value });
  },
  code: function (e) {
    this.setData({ code: e.detail.value });
  },
  /**
   * 获取验证码
   */
  getphoneCodeFun() {
    var that=this;
    // 
    //that.countDown();

    var userId = wx.getStorageSync("userId");
    if (util.isStrEmpty(this.data.phone)){
      wx.showToast({
        title: '手机号码不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (!(/^1[345789]\d{9}$/.test(this.data.phone)) ) {
      wx.showToast({
        title: '请输入有效手机号码',
        icon: 'none',
        duration: 1000
      })
      return;
    } 
    if ( this.data.phone.length > 11){
      wx.showToast({
        title: '请输入有效手机号码',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    that.countDown();
    var userID = that.data.userId
    if (userID==''){
      userID = wx.getStorageSync("userId");
    }
    var obj = `?PhoneNo=${this.data.phone}&UserId=${userID}`
    wx.request({
      url: app.urls.GetCheckNum + obj,
      method: 'get',//POST
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res);
        if(res.data.code=='0'){

        }else{
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1500
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '获取验证码失败！',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  //校验验证码
  getCodeFun(){
    var that = this;
    if (util.isStrEmpty(this.data.phone)) {
      wx.showToast({
        title: '手机号码不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (!(/^1[345789]\d{9}$/.test(this.data.phone))) {
      wx.showToast({
        title: '请输入有效手机号码',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (this.data.phone.length > 11) {
      wx.showToast({
        title: '请输入有效手机号码',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (util.isStrEmpty(this.data.code)) {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    var userId = wx.getStorageSync("userId");
    var obj={
      PhoneNo: that.data.phone,
      ValidCode: that.data.code,
      TvLogin: that.data.isQRCodeLogin,
      StoreCode: that.data.sqlid,   
      Unionid: that.data.unionid,
      OpenId: that.data.openid,
      Deviceid: that.data.deviceid
    }
    console.log(JSON.stringify(obj));
    wx.request({
      url: app.urls.CheckCode, //+ '?phoneNum=' + this.data.phone + '&checkNum=' + that.data.code,
      method: 'POST',
      data: JSON.stringify(obj),
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res);       
        if (res.data.code == '0') {
          var user_id = res.data.data.userId;
          wx.setStorageSync('userId', user_id);
          // 获取token
          wx.request({
            url: app.urls.AccountTokenGet + '?Unionid=' + res.data.data.unionId,
            method: 'get',
            header: {
              'content-type': 'application/json', // 默认值
              'Channel': 'UA',
              'CallSource': 'XCX',
              'DeviceCode': '',
            },
            success: function (res) {
              wx.hideLoading();
              if (res.data.code=='0'){
                wx.setStorageSync('AccountTokenGet', res.data.data);
                if (!app.utils.isEmpty(res.data.data.userId)) {
                  // 跳转在tabBar 页面
                  switch (that.data.back) {
                    case "index": 
                      wx.switchTab({
                        url: '../index/index'
                      })
                      break;
                    case "tempOrder":
                      wx.navigateTo({
                        url: '../temOrder/temOrder?tempOrderId=' + that.data.tempOrderId
                      })
                      break;
                    case "3Dclay":
                        wx.navigateTo({
                          url: '../../userCenter/3Dclay/3Dclay',
                        })
                      break;
                    default:
                      wx.navigateBack({
                        delta: 1
                      })
                      break;
                  }
                }
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
                title: '获取用户失败！',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }

      },
      fail: function () {
        wx.showToast({
          title: '获取验证码失败！',
          icon: 'none',
          duration: 3000
        })
      }
    })
  }
})