var app = getApp();
var n = 0;
var m = 0;
Page({
    data: {
      off: true,
    },
    customData: {},
    onLoad: function (params) {
      var that=this;
      n++;
      // 获取定位
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = String(res.latitude);
          var longitude = String(res.longitude);
          var loction = {};
          loction.latitude = latitude;
          loction.longitude = longitude;
          wx.setStorageSync("weixinLoction", loction);
          that.loadPage();
        },
        fail: function () {
          wx.showToast({
            title: '授权失败！',
            icon: 'none',
            duration: 2000
          })
          setTimeout(()=>{
            wx.switchTab({
              url: '../../info/index/index'
            })
          },2000)
        }
      })
    },
    loadPage: function (){
      var context=this;
      var loction = wx.getStorageSync("weixinLoction");
      if (loction.longitude == undefined || loction.latitude == undefined){
        context.getUserLocation();
      }else{
        var obj = '?Longitude=' + loction.longitude + '&Latitude=' + loction.latitude//获取本地定位信息；
        wx.request({
          url: app.urls.getStoreList + obj,
          method: 'get',
          header: {
            'Channel': 'UA',
            'CallSource': 'XCX',
            'DeviceCode': '',
          },
          success: function (res) {
            console.log(res);
            if (res.data.code == '0') {
              var video = res.data.data;
              for (var i = 0; i < video.length; i++) {
                var items = parseFloat(video[i].distance);
                if (items > 1000) {
                  video[i].distance = (items / 1000).toFixed(1) + "Km";
                } else {
                  video[i].distance = items.toFixed(1) + "m";
                }
              }
              context.data.videos = video;
              context.setData(context.data);
              console.log(context.data);
            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    },

    /**
  * 获取定位
  */
    getUserLocation: function () {
      var  that = this;
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = String(res.latitude);
          var longitude = String(res.longitude);
          var loction = {};
          loction.latitude = latitude;
          loction.longitude = longitude;
          wx.setStorageSync("weixinLoction", loction);
          that.loadPage();
        },
        fail: function () {
          var loction = {
            latitude: "31.216198",
            longitude: "121.477776"
          }
          wx.setStorage({ key: "weixinLoction", data: loction });
          that.loadPage();
        }
      })
    },
    onReady: function () {

    },
    onShow: function () {
      var that = this;
      if (m >= n) {
        that.getUserLocation();
      }
      m++;
      that.setData({
        off: true
      })
    },
    getCoupons:function(e){
      var that=this;
      wx.getSetting({
        success(res) {
          console.log(res.authSetting['scope.userLocation'])
          if (res.authSetting['scope.userLocation']){
            var storeId = e.currentTarget.dataset.store_id;
            var longitude = e.currentTarget.dataset.longitude;
            var latitude = e.currentTarget.dataset.latitude;
            var storeName = e.currentTarget.dataset.storename;
            wx.navigateTo({
              url: '../getCoupons/getCoupons?storeId=' + storeId + '&longitude=' + longitude + '&latitude=' + latitude + '&storeName=' + storeName
            })
          }else{
            // wx.showModal({
            //   title: '是否要打开设置界面',
            //   content: '需要获取您的位置信息，请到小程序的设置中打开授权',
            //   confirmText: "确认",
            //   cancelText: "取消",
            //   success: function (res) {
            //     console.log(res);
            //     //点击“确认”时打开设置页面
            //     if (res.confirm) {
                  wx.openSetting({
                    success(res) {
                      if (res.authSetting['scope.userLocation']) {
                        var storeId = e.currentTarget.dataset.store_id;
                        var longitude = e.currentTarget.dataset.longitude;
                        var latitude = e.currentTarget.dataset.latitude;
                        var storeName = e.currentTarget.dataset.storename;
                        wx.navigateTo({
                          url: '../getCoupons/getCoupons?storeId=' + storeId + '&longitude=' + longitude + '&latitude=' + latitude + '&storeName=' + storeName
                        })
                      } else {
                        wx.showToast({
                          title: '打开授权失败！',
                          icon: 'none',
                          duration: 1500
                        })
                      }
                    },
                    fail: function (err) {
                      console.log(err)
                    }
                  })
                // } else {
                //   console.log('用户点击取消')
                // }
              //}
            //});
          }
        }
      })
    },
    onPullDownRefresh: function () {
      this.loadPage();
      wx.stopPullDownRefresh()
    }
});