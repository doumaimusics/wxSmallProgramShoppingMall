// pages/userCenter/paymentSelect/paymentSelect.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    paytype: "2",// 默认是微信
    btnoff: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //var underLinedata = JSON.parse(options.underLinedata)
    this.setData({
      orderId: options.orderId,
      payType: options.options
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
    wx.stopPullDownRefresh();
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
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  radioChange: function (e) {
    var paytype = e.detail.value;
    this.setData({ paytype: paytype });
  },
  // 线下支付
  goPay: function (e) {
    var that = this;
    if (payType == that.data.paytype){
      if (that.data.paytype==1){
        wx.showToast({
          title: '当前订单的支付方式就是支付宝支付',
          icon:'none',
          duration:2000
        })
      }else{
        wx.showToast({
          title: '当前订单的支付方式就是微信支付',
          icon: 'none',
          duration: 2000
        })
      }
    }else{ // 修改原订单的支付方式
      var AccessTokey = wx.getStorageSync("AccountTokenGet");
      if (AccessTokey == null || AccessTokey == "") {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 1000
        })
        return
      }
      var btnoff = this.data.btnoff;
      if (btnoff) {
        var AccessTokey = wx.getStorageSync("AccountTokenGet");
        var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
        // 提交时间过长加上Loading
        wx.showLoading({
          title: '加载中',
          mask: true,
        })
        var obj = {
          OrderId: that.data.orderId,
          Type: that.data.paytype
        }
        wx.request({
          url: app.urls.OrderUpdataPayType,
          method: 'POST',
          data: obj,
          header: {
            'content-type': 'application/json', // 默认值
            'Authorization': token,
            'Channel': 'UA',
            'CallSource': 'XCX',
            'DeviceCode': '',
          },
          success: function (res) {
            if (res.data.code == "0") {
              // 支付宝支付
              if (that.data.paytype == "1") {
                wx.navigateTo({
                  url: '../../info/alipay/alipay'
                })
                return;
              } // 微信支付
              else {
                // 选择微信支付先判断是扫码进入的还是本地支付
                if (that.data.paytype == "2") {// isStore==true是扫码进入则需要扫描大屏支付
                  wx.navigateTo({
                    url: '../payCenter/payCenter'
                  })
                  return;
                }
              }
            } else {
              that.setData({
                btnoff: true
              })
              var title = res.data.message == undefined ? '请求失败！' : res.data.message;
              wx.showToast({
                title: title,
                icon: "none",
                duration: 3000
              })
            }
          },
          fail: function (res) {
            console.log(JSON.stringify(res))
            wx.showToast({
              title: '加载失败',
              icon: "none",
              duration: 3000
            })
          },
          complete: function (com) {
            //token过期
            if (com.statusCode == 401) {
              // 重新获取token
              app.funGetToken();
            }
            setTimeout(() => {
              wx.hideLoading();
            }, 3000);

          }
        })
        this.setData({
          btnoff: false,
          clicktrue: true
        })
      }
    }
  },
})