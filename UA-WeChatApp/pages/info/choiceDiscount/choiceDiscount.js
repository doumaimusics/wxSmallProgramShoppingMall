var app = getApp();
Page({
  data: {
    //coupon: [],
    storesqlid:''
  },
  // 页面加载
  onLoad: function (options) {
    if (options.storesqlid) {
      this.setData({ storesqlid: options.storesqlid });
    } 
    this.loadPage();
  },
  // 初始化方法
  loadPage: function () {
    // 页面初始化 storesqlid需要从二维码中获取
    var storesqlid = this.data.storesqlid;
    
    var loction = wx.getStorageSync("weixinLoction")
    var longitude = loction.longitude
    var latitude = loction.latitude
    var userId = wx.getStorageSync("userId");

    var obj = {
      store_id: storesqlid,//店铺代码  需要传过来，否则默认电商店
      user_id: userId,//'59f99eb9cd375715e8a8060b',//'5a6066eacd375a11600050fb',
      longitude: longitude,
      latitude: latitude
    };//获取本地定位信息；
    var objJson = JSON.stringify(obj);
    var objJsonEn = app.utils.AES_Encrypt(objJson);
    objJsonEn = encodeURIComponent(objJsonEn);
    // 获取店铺优惠券列表
    var that = this;
    app.request(this, app.urls.GetStoreCouponListByStoreSqlId, 'get', objJsonEn, function (context, res) {
      console.log(res);
      if (res.code=='0000'){
        that.setData({ coupon: res.data.coupons})
      }else{
        wx.showToast({
          title: res.message,
          icon: 'none',
          duration: 1500
        })
      }
      // 计算距离
      /* var couponBox = res.data;
      var items = parseFloat(couponBox.distance);
      if (items > 1000) {
        couponBox.distance = (items / 1000).toFixed(1) + "Km";
      } else {
        couponBox.distance = items.toFixed(1) + "m";
      }*/
    })
  },

  //页面初次渲染完成
  onReady: function () {
   
  },
  //页面显示
  onShow: function () {
   
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  // 获取用户输入的优惠券码
  getCode: function(e){
    var val = e.detail.value;
    this.setData({
      code: val
    });
  },
  // 绑定事件
  binding:function () {
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
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res);
        if (res.data.code=='0000'){
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000
          })
          // 绑定成功刷新优惠券列表
          that.loadPage();  
        }else{
          wx.showToast({
            title: '无效优惠券码',
            icon: 'loading',
            //image:'https://wx.3dculab.com/wxMsgSvr/hellokittyimg/resources/imgs/x5.png',
            image:'../../../resources/imgs/x5.png',
            duration: 2000
          })
        }
      }
    })
  },
  // 点击优惠券  获取id返回支付页面
  getCoupon:function(e){
    console.log(e);
    // 
    var pages = getCurrentPages();
    //var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      couponId: e.currentTarget.dataset.index
    })
    // 返回前一个页面
    wx.navigateBack({
      delta: 1
    })
  }
});
