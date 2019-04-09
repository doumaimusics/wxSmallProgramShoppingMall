var app = getApp();
Page({
  data: {
    off: true
  },
  onLoad: function (options) {
    var loction = wx.getStorageSync("weixinLoction")
    var obj = {
      longitude: loction.longitude,
      latitude: loction.latitude
    };//获取本地定位信息；
    var objJson = JSON.stringify(obj);
    var objJsonEn = app.utils.AES_Encrypt(objJson);
    objJsonEn = encodeURIComponent(objJsonEn);
    app.request(this, app.urls.getStoreList, 'get', objJsonEn, function (context, res) {
      var video = res.data;
      for (var i = 0; i < video.length; i++) {
        var items = parseFloat(video[i].distance);
        var coupon = video[i].coupon_info.substring(7);
        video[i].coupon_info = coupon;
        if (items > 1000) {
          video[i].distance = (items / 1000).toFixed(1) + "Km";
        } else {
          video[i].distance = items.toFixed(1) + "m";
        }
      }
      context.data.videos = video;
      context.setData(context.data);
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
    this.setData({
      off: true
    })
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
  
  map:function(e){
    var longitude = e.currentTarget.dataset.longitude;
    var latitude = e.currentTarget.dataset.latitude;
    var off = this.data.off;
    if (off) {
      wx.navigateTo({
        url: '../map/map?longitude=' + longitude + '&latitude='+ latitude,
      })
      this.setData({
        off: false
      })
    }
        // wx.openLocation({
        //   latitude: latitude,
        //   longitude: longitude,
        //   scale: 12
        // })
  }

})