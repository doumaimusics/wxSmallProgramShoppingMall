// pages/info/log/log.js
Page({
  data: {
    src:'https://wx.3dculab.com/uaxcxv1.0.1/Content/UAXCXvideo.mp4',
    //src:'https://wx.3dculab.com/wxMsgSvr/videos/5b21d437e6c58c0e985f1492.mp4',
    imagehide:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
      imagehide: true
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  onUnload: function () {

  },
  playViedo:function(){
    this.setData({
      imagehide: false
    })
    var videoContext = wx.createVideoContext("videoId")
    videoContext.play()
  }
})