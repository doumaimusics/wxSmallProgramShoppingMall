var app = getApp();
var n = 1;
var mta = require('../../../utils/mta_analysis');
Page({
  data: {
    type_all: true,
    type_news: false,
    type_price: false,
    type_sort_news: false,
    type_sort_pri: false,
    sortField: "normal",
    sortType: "asc",
    off: true,
    sign: false,
    pageTitle: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    console.log("ID", params)
    mta.Page.init()
    var id = params.id;
    this.setData({
      promotionId: id,
      pageTitle: params.title
    });
    wx.setNavigationBarTitle({
      title: params.title
    })
    n = 1;
    this.pageloadFun();

  },
  /**
   * 获取所有商品列表的方法
   */
  pageloadFun: function () {
    wx.showLoading({
      title: '加载中',
    });
    var context = this;
    var obj = `?promotionId=${context.data.promotionId}&pageIndex=1&sortField=${context.data.sortField}&sortType=${context.data.sortType}`
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
        console.log(res)
        context.setData({
          sign: true
        })
        wx.hideLoading();
        if (res.data.code == '0') {
          if (res.data.data.length > 0) {
            var mallList = res.data.data;
            context.setData({
              mallLists: mallList,
              messages: res.data.message
            })
          } else {
            if (n > 1) {
              wx.showToast({
                title: '数据加载完全',
                icon: "none",
                duration: 2000
              });
            } else {
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
  //筛选tap切换
  tapChange(e) {
    console.log(e)
    switch (e.target.id) {
      case "all":
        this.setData({
          type_all: true,
          type_news: false,
          type_price: false,
          type_sort_news: this.data.type_sort_news,
          type_sort_pri: this.data.type_sort_pri,
          sortField: "normal"
        })
        this.pageloadFun()
        break;
      case "news":
        this.setData({
          type_all: false,
          type_news: true,
          type_price: false,
          type_sort_news: !this.data.type_sort_news,
          type_sort_pri: this.data.type_sort_pri,
          sortField: "new",
          sortType: "desc"
        })
        this.pageloadFun()
        break;
      case "pri":
        this.setData({
          type_all: false,
          type_news: false,
          type_price: true,
          type_sort_news: this.data.type_sort_news,
          type_sort_pri: !this.data.type_sort_pri,
          sortField: "price",
          sortType: this.data.type_sort_pri ? "asc" : "desc"
        })
        this.pageloadFun()
        break;
      default:
        break;
    }
  },
  //排序
  handelSort(e) {
    switch (e.target.id) {
      case "sort_new":
        this.setData({
          type_sort_pri: false,
          type_sort_news: !this.data.type_sort_news,
          type_all: false,
          type_news: true,
          type_price: false,
          sortField: "new",
          sortType: this.data.type_sort_news ? "asc" : "desc"
        })
        this.pageloadFun()
        break;
      case "sort_pri":
        this.setData({
          type_sort_news: false,
          type_sort_pri: !this.data.type_sort_pri,
          type_all: false,
          type_news: false,
          type_price: true,
          sortField: "price",
          sortType: this.data.type_sort_pri ? "asc" : "desc"
        })
        this.pageloadFun()
        break;
      default:
        break;
    }
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
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    if (AccessTokey) {
      if (AccessTokey.userToken == undefined || AccessTokey.userToken == 'undefined' || AccessTokey.userToken.tokenType == undefined || AccessTokey.userToken.accessToken == undefined) {
        //此时清空storage
        wx.clearStorageSync();
      }
    }
    this.setData({
      off: true
    });
    // n=1;
    // this.pageloadFun();
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
    n = 1;
    this.pageloadFun();
    wx.stopPullDownRefresh();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.pageTitle,
      path: 'pages/info/recommend/recommend?id=' + this.data.promotionId + '&title=' + this.data.pageTitle,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    wx.getNetworkType({
      success(res) {
        if (res.networkType == 'none') {
          wx.hideLoading();
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
    if (n > Number(this.data.messages)) {
      wx.hideLoading();
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
      var obj = `?promotionId=${that.data.promotionId}&pageIndex=${n}&sortField=${that.data.sortField}&sortType=${that.data.sortType}`
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
              mallList.forEach((v, i) => {
                var mallarr = that.data.mallLists;
                mallarr.push(v);
              })
              that.setData(that.data)
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
    console.log(GoodsID + "--" + storeId)
    console.log(e)
    if (off) {
      // Shoe（鞋子），Goods（配件），Dress（衣服）
      if (name == "Goods") {
        mta.Event.stat('peijianzhuanquj', {
          'partslistclick': 'true'
        })
        wx.navigateTo({
          url: '../detailsVahooGoods/detailsVahooGoods?GoodsID=' + GoodsID + '&StoreID=' + storeId,
        })
      } else {
        mta.Event.stat('zhuanqujiarugou', {
          'listclick': 'true'
        })
        wx.navigateTo({
          url: '../details/details?GoodsID=' + GoodsID + '&StoreID=' + storeId,
        })
      }
      this.setData({
        off: false
      })
    }
  }
})
