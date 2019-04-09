// pages/info/log/log.js
Page({
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(onLoad);
    var that = this;
    wx.getSystemInfo({
      success: function (info) {
        that.data.windowHeight = info.windowHeight;
        that.setData(that.data);
        console.log(that.data.windowHeight);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log(onReady);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(onShow);
    var userInfo = wx.getStorageSync('weixinUserInfo');
    var loction = wx.getStorageSync("weixinLoction");
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    // AccessTokey来判断登录
    if (AccessTokey !== "") {
      wx.switchTab({
        url: '../index/index'
      })
    } else if (AccessTokey == "") {
      wx.reLaunch({
        url: '../login/login'
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },
  onUnload:function(){
   
  }
})