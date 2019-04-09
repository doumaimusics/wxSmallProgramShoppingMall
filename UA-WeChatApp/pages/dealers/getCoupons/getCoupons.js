var app = getApp();
Page({
  data:{
    indicatorDots: true,
    myoptions: null,
    indicatorColors: "#fff",
    indicatorActiveColor: "#fc2b6d",
    autoplay: true,
    interval: 5000,
    duration: 500,
    circulars: true,
    off:true,
    off1: true,
    myoptions:null,
    defaultImage: 'http://api2.3dculab.com/api/Files/DownFileById?id=5bbd5ccee6c58c13b0150df9',
    isFor: false,//是否循环默认为false
  },
  onLoad:function(options){
    var con = this;
    if (options !== undefined) {
      con.setData({ myoptions: options});
      // 设置地图上面的标记点
      con.setData({
        'markers': [{
          iconPath:'../../../resources/imgs/img_map.png',
          id : 0,
          latitude :con.data.myoptions.latitude,
          longitude : con.data.myoptions.longitude,
          width : 50,
          height :50,
        }],
      });
    }
  },
  onReady:function(){
    // 页面渲染完成
    this.loadPage();
  },
  loadPage: function () {
    var context = this;
    var loction = wx.getStorageSync("weixinLoction")
    var obj = '?longitude=' + loction.longitude + '&latitude=' + loction.latitude//获取本地定位信息；
    wx.request({
      url: app.urls.getStoreList + obj,
      method: 'get',
      header:{
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        //console.log(res);
        var video = res.data.data;
        var jsonData=''
        for (var i = 0; i < video.length; i++) {
          if (context.data.myoptions.storeId == video[i].store_id){
            var items = parseFloat(video[i].distance);
            if (items > 1000) {
              video[i].distance = (items / 1000).toFixed(1) + "Km";
            } else {
              video[i].distance = items.toFixed(1) + "m";
            }
            if (video[i].store_picture.length>0){
              context.setData({
                isFor:true
              })
            }else{
              context.setData({
                isFor: false
              })
            }
            jsonData = video[i]
          }
         
        }
        context.data.videos = jsonData;
        context.setData(context.data);
        //console.log(context.data);
      }
    })
  },
  onShow:function(){
    var that=this;
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
        
      }
    })
    this.setData({
      off1: true
    })
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }, 
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  makeFreeCall: function (e) {
    var telephone = e.currentTarget.dataset.telephone;
    wx.makePhoneCall({
      phoneNumber: telephone
    })
  },

  map: function () {
    var that = this;
    var off1 = this.data.off1;
    if (off1) {
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度  
        success: function (res) {
          that.setData({
            off1: false
          })
          wx.openLocation({
            latitude: parseFloat(that.data.videos.latitude),
            longitude: parseFloat(that.data.videos.longitude),
            name: that.data.myoptions.storeName,
            scale: 15,
          })
        },
        fail:function(){
          that.setData({
            off1: true
          })
          wx.openSetting({
            success(res) {
              console.log(res.authSetting)
            },
            fail: function (err) {
              console.log(err)
            }
          })
        }
      })
      
    }
  },
})