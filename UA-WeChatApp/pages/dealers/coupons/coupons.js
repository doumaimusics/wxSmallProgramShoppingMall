var app = getApp();
Page({
  data: {
    tabArr: {
            tabCurIndex: 0,
            tabCurConIndex: 0
        }
  },
  onLoad: function (options) {
    this.loadPage();
  },
  loadPage:function(){
    var userId = wx.getStorageSync("userId");
    var obj = {
      user_id: userId,//'5a6066eacd375a11600050fb'
    };
    var objJson = JSON.stringify(obj);
    var objJsonEn = app.utils.AES_Encrypt(objJson);
    objJsonEn = encodeURIComponent(objJsonEn);
    app.request(this, app.urls.getCouponListByUserId, 'get', objJsonEn, function (context, res) {
      console.log(res);
      var coupons = res.data;
      if (coupons.length == 0) {
        wx.showToast({
          title: "无优惠券",
          icon: "none",
          duration: 3000
        })
      }
      context.data.coupons = coupons;
      context.setData(context.data);
      console.log(context.data)
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  tabFun: function(e) {
        var _datasetId = e.target.dataset.id;
        console.log("---" + _datasetId + "---");
        var _obj = {};
        _obj.tabCurIndex = _datasetId;
        _obj.tabCurConIndex = _datasetId;
        var that = this;
        that.setData({
            tabArr: _obj
        });
  },
  onPullDownRefresh: function () {
    this.loadPage();
    wx.stopPullDownRefresh()
  },
  // 获取用户输入的优惠券码
  getCode: function (e) {
    var val = e.detail.value;
    this.setData({
      code: val
    });
  },
  // 绑定事件
  binding: function () {
    //var storeId= ''; // 店铺id
    var userId = wx.getStorageSync("userId");
    var inputCode = this.data.code;//优惠券码
    var obj = {
      store_id: this.data.storesqlid,
      user_id: userId,//'59f99eb9cd375715e8a8060b',//'5a6066eacd375a11600050fb',
      code: inputCode
    };//获取本地定位信息；
    console.log(obj);
    var objJson = JSON.stringify(obj);
    var objJsonEn = app.utils.AES_Encrypt(objJson);
    //objJsonEn = encodeURIComponent(objJsonEn);
    objJsonEn = JSON.stringify({ param: objJsonEn });
    // 绑定优惠券
    var that = this;
    wx.request({
      url: app.urls.BindCouponByCode,
      method: 'POST',
      data: objJsonEn,
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == '0000') {
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000
          })
          // 绑定成功刷新优惠券列表
          that.loadPage();
        } else {
          wx.showToast({
            title: '无效优惠券码',
            icon: 'loading',
            //image:'https://wx.3dculab.com/wxMsgSvr/hellokittyimg/resources/imgs/x5.png',
            image: '../../../resources/imgs/x5.png',
            duration: 2000
          })
        }
      }
    })
  },
})