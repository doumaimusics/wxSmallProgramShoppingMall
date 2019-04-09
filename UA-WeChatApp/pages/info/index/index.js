var app = getApp();
var con;
var mta = require('../../../utils/mta_analysis');
Page({
  data: {
    indicatorDots: true,
    myoptions: null,
    indicatorColors: "rgba(255,255,255,0.3)",
    indicatorActiveColor: "#fff",
    animationData: {},
    autoplay: true,
    interval: 5000,
    duration: 500,
    circulars: true,
    off: true,
    isLogin: false,
    Height: '',
    //modalTaggle:'',//默认一个内容都不显示
    //avtivityBtn:'',
  },
  onLoad: function (options) {
    mta.Page.init()
    con = this;
    if (options != undefined && options.q != undefined) {
      con.setData({
        myoptions: options
      });
    }
    //跑马灯
    this.requestScroll()
    // 获取首页轮播图
    con.initDta();
    // 获取首页活动列表
    con.openActivityFun();
    // 获取首页活动列表
    con.getCategoryList();
  },
  /**
   * 获取根据活动ID获取活动封面图片
   */
  openActivityFun: function () {
    var that = this;
    wx.request({
      url: app.urls.GetPromotionsIndexPicUAByID,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        //console.log(res);
        if (res.data.code = '0') {
          var Promotions = res.data.data.slice(2, 12);
          var Promotions2 = res.data.data.slice(0, 2);
          that.setData({
            Promotions: Promotions,
            Promotions2: Promotions2
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  /**
   * 计算轮播图的高度
   */
  imgHeight: function (e) {
    var winWid = wx.getSystemInfoSync().windowWidth; //获取当前屏幕的宽度
    var imgh = e.detail.height; //图片高度
    var imgw = e.detail.width; //图片宽度
    var swiperH = winWid * imgh / imgw + "px" //等比设置swiper的高度。 即 屏幕宽度 / swiper高度 = 图片宽度 / 图片高度  ==》swiper高度 = 屏幕宽度 * 图片高度 / 图片宽度
    this.setData({
      Height: 560 + "rpx" //设置高度
    })
  },

  //跑马灯请求
  requestScroll() {
    var that = this
    wx.request({
      url: "https://partner.fansnew.com/miniprogram/details/info",
      method: 'get',
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            msg: res.data.data.msg
          })
        } else {
          console.log("状态码：" + res.data.code)
        }
      },
      fail: function () {
        console.error("跑马灯接口出错~")
      }
    })
  },
  //加载数
  initDta: function () {
    // 获取首页轮播图
    wx.request({
      url: app.urls.GetPromotionsSmallBannerList,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res)
        var ImageList = res.data.data;
        if (ImageList !== undefined) {
          con.setData({
            imgUrls: ImageList
          })
        }
      },
      fail: function () {
        con.setData({
          fuj: 'Fail'
        })
      }
    })
  },
  onReady: function () {
    // //设置导航栏title
    // wx.setNavigationBarTitle({
    //     title: ""
    // });
  },
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      //console.log(res.target)
    }
    return {
      title: "UA智慧体验",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onShow: function () {
    var con = this;
    this.setData({
      off: true,
      //avtivityBtn:'',
      //showModal: false,//返回之后模态框关闭
    })
    // 首页就判断是否登录.
    // var AccountTokenGet = wx.getStorageSync('AccountTokenGet')
    // if (!app.utils.isEmpty(AccountTokenGet)) {
    //   con.setData({isLogin:true});
    // }else{
    //   wx.navigateTo({
    //     url: '../login/login'
    //   })
    // }      
  },
  /**
   * 下拉刷新
   * */
  onPullDownRefresh: function () {
    // 获取首页轮播图
    this.initDta();
    // 获取首页活动列表
    this.openActivityFun();
    // 获取首页活动列表
    this.getCategoryList();
    wx.stopPullDownRefresh()
  },
  /**
   * 首页点击活动进入商品列表页面
   */
  openReommend: function (e) {
    console.log(e)
    var array = e.currentTarget.dataset.array;
    mta.Event.stat("home_click", {
      id: array.id,
      source: array.name
    })
    mta.Event.stat('zhuanqujiarugou', {
      'areaclick': 'true'
    })
    wx.navigateTo({
      url: '../recommend/recommend?id=' + array.id + '&title=' + array.name,
    })
  },
  /**
   * 点击底部的三个按钮切换
   */
  setModal: function (e) {
    // 点击空白区域关闭模态框
    if (e.currentTarget.dataset.name == '其他') {
      this.setData({
        showModal: false,
        avtivityBtn: '',
      })
      return;
    }
    ////打开的动画
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(820).step()
    this.setData({
      animationData: animation.export()
    })

    //关闭的动画
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
    }.bind(this), 100)
    // 控制影藏和显示
    //默认showModal为false
    if (this.data.showModal) {
      //如果打开着分两种情况
      //1. 如果当前显示的内容和点击的内容一样，直接关闭模态框
      //2.如果当前显示的内容和点击的内容不一样，那就显示点击的内容
      if (e.currentTarget.dataset.name == '服装') {
        //选择了服装并且内容也显示服装的内容
        if (e.currentTarget.dataset.name == this.data.avtivityBtn && this.data.modalTaggle == true) {
          this.setData({
            showModal: false,
            avtivityBtn: '',
          })
        } else {
          this.setData({
            showModal: true,
            modalTaggle: true,
            avtivityBtn: '服装'
          })
        }
      }
      if (e.currentTarget.dataset.name == '鞋品') {
        if (e.currentTarget.dataset.name == this.data.avtivityBtn && this.data.modalTaggle == false) {
          this.setData({
            showModal: false,
            avtivityBtn: '',
          })
        } else {
          this.setData({
            showModal: true,
            modalTaggle: false,
            avtivityBtn: '鞋品'
          })
        }
      }

    } else {
      //那就打开模态框
      this.setData({
        showModal: true
      })
      //选中某一个
      if (e.currentTarget.dataset.name == '服装') {
        this.setData({
          modalTaggle: true, // 点击之后判断显示的内容
          avtivityBtn: '服装', // 替换name
        })
      } else if (e.currentTarget.dataset.name == '鞋品') {
        this.setData({
          modalTaggle: false,
          avtivityBtn: '鞋品',
        })
      }
    }
  },
  /**
   * 首页点击活动进入商品列表页面
   */
  openThreeReommend: function (e) {
    if (e.currentTarget.dataset.name == '配件') {
      this.setData({
        avtivityBtn: '配件'
      })
    }
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: app.urls.GetPromotionsIndexPicUAByID + '?PromotionId=' + id,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res);
        if (res.data.code = '00000') {
          var array = [];
          res.data.data.forEach((v, m) => {
            v.promotionsDBrefList.forEach((s, i) => {
              array.push(s)
              app.urls.activityArray = array; // 将数组赋值给全局对象
              wx.navigateTo({
                url: '../recommend/recommend',
              })
            })

          });
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  /**
   * 搜索
   */
  openRearch: function (e) {
    mta.Event.stat("home_search_click", {})
    wx.navigateTo({
      url: `../rearch/rearch`,
    })
  },
  /**
   * 获取首页活动分类商品信息
   */
  getCategoryList: function () {
    wx.request({
      url: app.urls.getCategoryList,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res)
        var CategoryList = res.data.data;
        if (CategoryList !== undefined) {
          con.setData({
            CategoryLists: CategoryList
          })
        }
      },
      fail: function () {
        con.setData({
          fuj: 'Fail'
        })
      }
    })
  },
  /**
   * 进入商品详情页
   */
  details: function (e) {
    var GoodsID = e.currentTarget.dataset.id;
    var storeId = e.currentTarget.dataset.storeid;
    var name = e.currentTarget.dataset.nama;
    var off = this.data.off;
    mta.Event.stat("home_alone_click", {
      name: name
    })
    mta.Event.stat('danpinjiarugouw', {
      'partsclick': 'true'
    })
    if (off) {
      // Shoe（鞋子），Goods（配件），Dress（衣服）
      if (name == "Goods") {
        mta.Event.stat('peijianjiarugou-1', {
          'partsdetails': 'true'
        })
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
});
