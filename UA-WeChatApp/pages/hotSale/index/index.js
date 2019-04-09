var app = getApp();
var n = 1;
var mta = require('../../../utils/mta_analysis');

Page({
  data: {
    off: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    mta.Page.init()
    this.setData({
      promotionId: '5bf26114e6c58c0920cda084'
    })
    wx.setNavigationBarTitle({
      title: '' //this.data.mername//页面标题为路由参数
    })
    this.pageloadFun();
  },
  /**
   * 获取所有商品列表的方法
   */
  pageloadFun: function () {
    wx.showLoading({
      title: '加载中',
    });
    n = 1;
    console.log(n);
    var context = this;
    var obj = `?promotionId=${context.data.promotionId}&pageIndex=1`
    wx.request({
      url: app.urls.getProductList + obj,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == '0') {
          if (res.data.data.length > 0) {
            var mallList = res.data.data;
            context.setData({
              mallLists: mallList,
              messages: res.data.message
            })
          } else {
            if(n>1){
              wx.showToast({
                title: '数据加载完全',
                icon: "none",
                duration: 2000
              });
            }else{
              wx.showToast({
                title: '当前无活动',
                icon: "none",
                duration: 2000
              });
            }
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: "none",
            duration: 2000
          });
        }

      }
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
      off:true
    })
    // 获取产品列表
    //this.pageloadFun();
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
    this.pageloadFun();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    wx.getNetworkType({
      success(res) {
        if (res.networkType =='none'){
          wx.showToast({
            title: "当前无网络！",
            icon: "none",
            duration: 3000
          })
          return false;
        }
      }
    })
    n = n + 1
    console.log(n);
    if (n > Number(this.data.messages)) {
      // wx.showToast({
      //   title: "数据加载完全",
      //   icon: "none",
      //   duration: 3000
      // })
      return false;
    } else {
      that.setData({
        pageIndex: n
      })
      var obj = `?promotionId=${that.data.promotionId}&pageIndex=${n}`
      wx.request({
        url: app.urls.getProductList + obj,
        method: 'get',
        header: {
          'content-type': 'application/json', // 默认值
          'Channel': 'UA',
          'CallSource': 'XCX',
          'DeviceCode': '',
        },
        success: function (res) {
          console.log(res.data.code);
          if (res.data.code == '0') {
            if (res.data.data.length > 0) {
              var mallList = res.data.data;
              var mallarr = that.data.mallLists;
              mallList.forEach((v, i) => {
                mallarr.push(v);
              })
              that.setData(that.data)
            } 
            // else {
            //   wx.showToast({
            //     title: '数据加载完全',
            //     icon: "none",
            //     duration: 2000
            //   });
            // }
          } else {
            wx.showToast({
              title: res.data.message,
              icon: "none",
              duration: 2000
            });
          }

        }
      })
    }
  },

  /**
   * 进入商品详情页
   */
  details: function (e) {
    var GoodsID = e.currentTarget.dataset.id;
    var storeId = e.currentTarget.dataset.storeid;
    var name = e.currentTarget.dataset.nama;
    var off = this.data.off;
    mta.Event.stat('remaishangpinji',{'hotlist':'true'})
    if (off) {
      // Shoe（鞋子），Goods（配件），Dress（衣服）
      if (name == "Goods") {
        wx.navigateTo({
          url: '../../info/detailsVahooGoods/detailsVahooGoods?GoodsID=' + GoodsID + '&StoreID=' + storeId,
        })
      } else {
        wx.navigateTo({
          url: '../../info/details/details?GoodsID=' + GoodsID + '&StoreID=' + storeId,
        })
      }
      this.setData({
        off: false
      })
    }
  }
})