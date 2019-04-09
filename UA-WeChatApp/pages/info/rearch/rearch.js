// pages/info/rearch/rearch.js
var app = getApp();
var n = 1;
var mta = require('../../../utils/mta_analysis');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    inputTextArr: [],
    searchState: '0', //搜索结果 默认为0 搜索到位2 没有搜索到1
    off: true,
    selectinputs: true,
    cursorNum: 0,
    confirmhold: false,
    domHide: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
    if (options.val) {
      this.setData({
        domHide: true,
        inputText: options.val
      })
      this.searchProductList(options.val);
      wx.setNavigationBarTitle({
        title: options.title
      })
    } else {
      wx.setNavigationBarTitle({
        title: "Under Armour"
      })
      this.setData({
        domHide: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var inputTextArr = wx.getStorageSync('inputTextArr');
    if (inputTextArr) {
      this.setData({
        ['inputTextArr']: inputTextArr
      });
    } else {
      this.setData({
        inputTextArr: []
      });
    }
    this.setData({
      off: true
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    n = n + 1
    if (n > Number(this.data.messages)) {
      wx.showToast({
        title: "数据加载完全",
        icon: "none",
        duration: 3000
      })
      return false;
    } else {
      var text = that.data.inputText
      var obj = `?str=${text}&pageIndex=${n}`
      wx.request({
        url: app.urls.searchProductList + obj,
        method: 'get',
        header: {
          'content-type': 'application/json', // 默认值
          'Channel': 'UA',
          'CallSource': 'XCX',
          'DeviceCode': '',
        },
        success: function (res) {
          console.log(res);
          var mallList = res.data.data;
          // 搜索到 list显示searchState
          var mallarr = that.data.mallLists;
          if (mallList != null && typeof (mallList) != "undefined" && mallList.length > 0) {
            for (var i = 0; i < mallList.length; i++) {
              var off = true;
              var goodsT = mallList[i]
              goodsT.off = true;
              mallarr.push(mallList[i]);
            }
            that.setData({
              searchState: 2,
              mallLists: mallarr
            })

          } else { // 没有搜索到
            that.setData({
              searchState: 1,
              searchFail: text
            })
          }
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 点击取消
   */
  cancelFun: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  searchText: function (e) {
    var that = this;
    that.setData({
      inputText: e.detail.value
    })
  },
  //清空输入框
  emptyInput: function () {
    var that = this;
    that.setData({
      inputText: ''
    })
  },
  /**
   * 点击清空
   */
  deleteFun: function () {
    var that = this;
    var inputTextArr = wx.getStorageSync('inputTextArr');
    if (inputTextArr) {
      wx.showModal({
        title: '提示',
        content: '确认删除全部历史搜索记录',
        success: function (res) {
          if (res.confirm) { //点击了确认
            wx.removeStorageSync('inputTextArr')
            // 删除之后调用onshow方法
            that.onShow();
          }
        }
      })
    } else {
      wx.showToast({
        title: '暂无搜索记录可删除',
        icon: 'none',
        duration: 1500
      })
    }
  },
  /**
   * 点击搜索
   */
  bindconfirmFun: function (e) {
    if (e.detail.value == "") {
      wx.showToast({
        title: '搜索内容不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      //发送请求
      this.setData({
        confirmhold: false,
        selectinputs: false,
      })
      mta.Event.stat("search_event", {
        value: e.detail.value
      })
      this.searchProductList(e.detail.value);
    }
  },
  //点击搜索记录带回input
  selectText: function (e) {
    var text = e.currentTarget.dataset.text
    mta.Event.stat("search_history_event", {
      value: text
    })
    this.setData({
      inputText: text,
      selectinputs: true,
      cursorNum: Number(text.length)
    })
    this.searchProductList(text);
  },
  /**
   * 搜索方法封装
   */
  searchProductList: function (text) {
    wx.pageScrollTo({
      scrollTop: 0
    });
    var that = this;
    var inputTextArrSet = this.data.inputTextArr
    //inputTextArrSet.push(e.detail.value);
    inputTextArrSet.splice(0, 0, text)
    // 需要数组去重一下
    var inputTextArr = Array.from(new Set(inputTextArrSet));
    if (inputTextArr.length > 6) { // 如果搜索记录大于6条
      var inputTextArr = inputTextArr.slice(0, 6);
      that.setData({
        ['inputTextArr']: inputTextArr
      })
    } else {
      that.setData({
        ['inputTextArr']: inputTextArr
      })
    }
    wx.setStorageSync("inputTextArr", inputTextArr);
    that.onShow();
    n = 1;
    var obj = `?str=${text}&pageIndex=1`
    wx.request({
      url: app.urls.searchProductList + obj,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res);
        var mallList = res.data.data;
        // 搜索到 list显示searchState
        if (mallList != null && typeof (mallList) != "undefined" && mallList.length > 0) {
          for (var i = 0; i < mallList.length; i++) {
            var off = true;
            var goodsT = mallList[i]
            goodsT.off = true;
          }
          that.setData({
            searchState: 2
          })
          that.data.mallLists = mallList;
          that.setData({
            messages: res.data.message
          })
          that.setData(that.data)
        } else { // 没有搜索到
          that.setData({
            searchState: 1,
            searchFail: text
          })
        }
      }
    })
  },
  /**
   * 搜索到之后的点击事件
   */ 
  details: function (e) {
    var GoodsID = e.currentTarget.dataset.id;
    var storeId = e.currentTarget.dataset.storeid;
    var name = e.currentTarget.dataset.nama;
    var off = this.data.off;
    console.log("GoodsID", GoodsID)
    console.log("storeId", storeId)
    if (off) {
      // Shoe（鞋子），Goods（配件），Dress（衣服）
      if (name == "Goods") {
        wx.navigateTo({
          url: '../detailsVahooGoods/detailsVahooGoods?GoodsID=' + GoodsID + '&StoreID=' + storeId,
        })
      } else {
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
