var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    type_state: 1,
    category: [],
    child_category: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCategory((item) => {
      this.getChildCategory(item[0].sort)
    })
  },
  // 获取分类树
  getCategory(callback) {
    var that = this
    wx.request({
      url: app.urls.getCategory,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        if (res.data.code == '0') {
          that.setData({
            category: res.data.data
          })
          callback && callback(res.data.data)
          console.log(res.data)
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  //获取子分类
  getChildCategory(sort) {
    var that = this
    wx.request({
      url: app.urls.getCategory,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        if (res.data.code == '0') {
          res.data.data.map((item) => {
            if (item.sort == sort) {
              console.log("子类", item)
              that.setData({
                child_category: item
              })
            }
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  //去搜索页
  go_search(e) {
    var val=e.currentTarget.dataset.condition.join(" ")
    var title=e.currentTarget.dataset.title
    if(!val){
      val="暂无关键字"
    }
    wx.navigateTo({
      url: `/pages/info/rearch/rearch?val=${val}&title=${title}` 
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 分类导航点击
  handelNav(e) {
    this.setData({
      type_state: e.currentTarget.dataset.sort
    })
    var sort = e.currentTarget.dataset.sort
    this.getChildCategory(sort)
  }
})
