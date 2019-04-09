Page({
  data: {
    // markers: [{
    //   iconPath: "../../../resources/imgs/img_map.png",
    //   id: 0,
    //   latitude: 23.099994,
    //   longitude: 113.324520,
    //   width: 50,
    //   height: 50
    // }],
    // controls: [{
    //   id: 1,
    //   iconPath: '../../../resources/imgs/img_map.png',
    //   position: {
    //     left: 0,
    //     top: 300 - 50,
    //     width: 50,
    //     height: 50
    //   },
    //   clickable: true
    // }]
  },
  onLoad: function (options) {
    var that = this;
    // 当前位置
    var loction = wx.getStorageSync("weixinLoction")
    var longitudes = loction.longitude
    var latitudes = loction.latitude
    wx.getSystemInfo({
      success: function (info) {
        that.data.windowHeight = info.windowHeight;
        that.setData(that.data);
        console.log(that.data.windowHeight);
      }
    });
    // 店铺位置
    var longitude = options.longitude;
    var latitude = options.latitude;
    var storeName = options.storeName;
    that.setData({
      storeLongitude: Number(longitude),
      storeLatitude: Number(latitude),
      storeName: storeName
    })
    that.setData({
      longitude: longitude,
      latitude: latitude,
      markers: [{
        iconPath: "../../../resources/imgs/img_map.png",
        id: 0,
        latitude: latitude,
        longitude: longitude,
        width: 50,
        height: 50,
        alpha:0.7
      }],
    });
    // 画路线
    // that.setData({
    //   polyline: [{
    //     points: [{
    //       longitude: longitude,
    //       latitude: latitude
    //     }, {
    //         longitude: longitudes,
    //         latitude: latitudes
    //     }],
    //     color: "#FF0000DD",
    //     width: 2,
    //     dottedLine: true
    //   }],
    // });
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
  click:function(){
    var that=this;
    
    wx.getLocation({ 
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度  
      success: function(res) {    
        //var latitude = res.latitude    
        //var longitude = res.longitude    
        wx.openLocation({
          latitude: that.data.storeLatitude,
          longitude: that.data.storeLongitude,
          name: that.data.storeName,
          scale: 15,
        }) 
        //wx.chooseLocation()
      }
    })

  }
})