var app = getApp();
var util = require('../../../utils/util.js');
var WXBizDataCrypt = require('../../../utils/RdWXBizDataCrypt.js');
var numSize = 0;
var thisapp;
var mta = require('../../../utils/mta_analysis')
Page({
  data: {
    indicatorDots: true,
    indicatorColors: "#ccc",
    indicatorActiveColor: "#000000",
    animationData: {},
    autoplay: true,
    interval: 5000,
    duration: 500,
    circulars: true,
    buyCount: "1", // 选择购买数量
    show: false,
    pagehid: "auto",
    height: "",
    btnoff: true,
    productId: "",
    storeId: "",
    sizeView: false, // 判断何时显示选择尺寸
    selectSize: '', // 将选择的这一条类目额尺寸保存起来
    skuImage: '',
    selectOrderSize: '',
    sign: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
    var productId = "";
    var storeId = "";
    if (options.sign && options.sign == 1) {
      this.setData({
        sign: true
      })
    }
    //兼容扫码查看详情
    if (options.q && options.q !== undefined) {
      var ewm_url = decodeURIComponent(options.q);
      var surls = ewm_url.split("/"); //分割网址，提取出参数
      var p = surls[surls.length - 1].split("|"); //最后一个是参数
      console.log(p); //打印出url
      productId = p[1];
      storeId = p[3];
      this.setData({
        sign: true
      })
    } else {
      productId = options.GoodsID;
      storeId = options.StoreID;
    }
    this.setData({
      productId: productId,
      storeId: storeId,
    })
    this.loadPage();
    thisapp = this;
  },
  loadPage: function () {
    var that = this;
    var productId = that.data.productId;
    var storeId = that.data.storeId;
    var obj = `?productId=${productId}&storeId=${storeId}`;
    wx.request({
      url: app.urls.getProductDetail + obj,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        if (res.data.code == '0') {
          var details = res.data.data;
          if (details.content && details.content !== '') {
            that.setData({
              detailInfo: details.content
            });
          }
          that.data.details = details;
          that.setData({
            details
          })

          for (var i = 0; i < details.colors.length; i++) {
            for (var j = 0; j < details.colors[i].skus_2_0.length; j++) {
              if (details.colors[i].skus_2_0[j].stores[0].quantity <= 0) {
                var bacBtn = false;
                var goodsT = details.colors[i]
                goodsT.bacBtn = false;
                goodsT.bacColor = "#fff";
                goodsT.colors = "#333";
                that.setData(that.data)
              } else {
                ++numSize;
                //console.log(numSize);
                if (numSize == 1) {
                  //先设置默认颜色
                  var goodsT = details.colors[i]
                  goodsT.bacBtn = true;
                  goodsT.bacColor = "#E61A23";
                  goodsT.colors = "#fff";
                  //在设置默认尺寸
                  goodsT.skus_2_0[j].bacBtn = true;
                  goodsT.skus_2_0[j].bacColor = "#E61A23";
                  goodsT.skus_2_0[j].colors = "#fff";
                  let sId = goodsT.skus_2_0[j].sku;
                  let keys = Object.keys(sId)[0];
                  var spec = goodsT.skus_2_0[j].sku[keys];
                  console.log(spec)
                  var specSize = `${goodsT.color}，${spec}`;
                  var stockNumber = goodsT.stockNumber
                  that.setData({
                    spec: spec,
                    size: goodsT.color,
                    specSize: specSize,
                    skuid: keys,
                    stockNumber: stockNumber
                  })
                  that.setData(that.data);
                }
              }
            }
          }
          app.shopNumber(that);
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取购物车数量 app.js中封装方法
    numSize = 0;
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    if (app.utils.isEmpty(AccessTokey)) {
      this.setData({
        IsLogin: false
      })
    } else {
      if (AccessTokey.userToken == undefined || AccessTokey.userToken == 'undefined' || AccessTokey.userToken.tokenType == undefined || AccessTokey.userToken.accessToken == undefined) {
        //此时清空storage
        wx.clearStorageSync();
      } else {
        app.shopNumber(this);

        //this.loadPage();  
        this.setData({
          IsLogin: true
        })
      }
    }
    this.setData({
      pagehid: "auto",
      height: "",
      btnoff: true
    })
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
    //因为下拉不改变用户已经选择的颜色和尺寸 所以不重新获取
    //this.loadPage();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},
  //用户点击标题自动复制到剪切板
  handelCopy: function (e) {
    var self = this;
    wx.setClipboardData({
      data: self.data.details.shoeName + self.data.details.pattern,
      success: function (res) {
        wx.showToast({
          title: '已复制到剪切板',
          icon: 'success',
          duration: 2000
        })
      }
    });
  },

  // 分享海报
  go_poster() {
    wx.navigateTo({
      url: `/pages/info/poster/poster?GoodsID=${this.data.productId}&StoreID=${this.data.storeId}&sign=1`
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var storeId = this.data.storeId;
    var productId = this.data.productId
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.details.ShoeName,
      imageUrl: this.data.details.qualityImages[0],
      path: "pages/info/details/details?GoodsID=" + productId + "&StoreID=" + storeId + "&sign=1",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  call: function () {
    wx.makePhoneCall({
      phoneNumber: '400-838-8931',
    })
  },
  //去首页
  go_home() {
    wx.switchTab({
      url: '../index/index'
    })
  },

  /***
   * 点击选择类目即颜色
   */
  btntap: function (e) {
    //console.log(e.currentTarget.dataset.skussize );
    var n = 1;
    var skussize = e.currentTarget.dataset.skussize;
    var index = e.currentTarget.id;
    //=======================
    //设置点击的类目
    for (var m = 0; m < this.data.details.colors.length; m++) {
      if (index == m) {
        this.data.details.colors[index].bacBtn = true
        this.data.details.colors[index].bacColor = "#E61A23";
        this.data.details.colors[index].colors = "#fff";

      } else {
        this.data.details.colors[m].bacBtn = false;
        this.data.details.colors[m].bacColor = "#fff";
        this.data.details.colors[m].colors = "#333";
      }
      this.setData(this.data);
    }
    var colors = this.data.details.colors[index].skus_2_0;
    for (var i = 0; i < colors.length; i++) {
      colors[i].bacBtn = false;
      colors[i].bacColor = '#fff';
      colors[i].colors = '#333';
      this.setData({
        selectSize: colors
      });
    }
    for (var i = 0; i < colors.length; i++) {
      // 获取当前颜色的价格
      var price = this.data.details.colors[index].skus_2_0[0].stores[0].price;
      this.setData({
        price: price
      });
      // 选择之后将颜色图片保存
      this.setData({
        skuImage: e.currentTarget.dataset.selectimg
      });
      var defaultNum = this.data.defaultNum;

      if (colors[i].stores[0].quantity != 0) {
        ++n;
        if (n == 2) {
          colors[i].bacBtn = true;
          colors[i].bacColor = '#E61A23';
          colors[i].colors = '#fff';
          let sId = colors[i].sku
          colors[i].skuId = Object.keys(sId)[0];
          this.setData({
            selectSize: colors,
          });
          let keys = Object.keys(sId)[0];
          var spec = colors[i].sku[keys];
          console.log(spec);
          var specSize = `${this.data.details.colors[index].color}，${spec}`;
          this.setData({
            selectOrderSize: colors[i]
          });
          this.setData({
            spec: spec,
            size: this.data.details.colors[index].color,
            specSize: specSize,
            stockNumber: this.data.details.colors[index].stockNumber,
          });
        }
        this.setData(this.data)
      } else {
        //将选择的这一条尺寸保存在data中
        this.setData({
          selectSize: colors
        });
        if (n == 1) {
          this.setData({
            selectOrderSize: ''
          });
        }
      }
      this.setData(this.data)
    }
  },
  /***
   * selectSizeBtn 点击选择尺寸
   */
  selectSizeBtn: function (e) {
    console.log(e);
    for (var i = 0; i < this.data.selectSize.length; i++) {
      if (e.currentTarget.dataset.skucode == this.data.selectSize[i].stores[0].skuCode) {
        this.data.selectSize[i].bacBtn = true
        console.log(this.data.selectSize[i])
        this.data.selectSize[i].bacColor = "#E61A23";
        this.data.selectSize[i].colors = "#fff";
        this.data.selectSize[i].skuId = e.currentTarget.dataset.skuid;
        //将选择的这一条尺寸保存在data中
        this.setData({
          selectOrderSize: this.data.selectSize[i]
        });
        let sId = this.data.selectSize[i].sku
        let keys = Object.keys(sId)[0];
        var spec = this.data.selectSize[i].sku[keys];
        console.log(spec);
        var specSize = `${this.data.size}，${spec}`;
        this.setData({
          spec: spec,
          specSize: specSize,
          defaultNum: i
        })
        // 选择之后将颜色图片保存
      } else {
        this.data.selectSize[i].bacBtn = false;
        this.data.selectSize[i].bacColor = "";
        this.data.selectSize[i].colors = "";
      }
    }
    this.setData(this.data)
  },
  /***
   * 选择购买数量
   * 
   */
  min: function (e) {
    if (this.data.buyCount >= 2) {
      this.data.buyCount--;
      var buy = this.data.buyCount;
      this.setData({
        buyCount: buy
      })
    }
  },
  add: function (e) {
    if (this.data.buyCount < 50) {
      this.data.buyCount++;
      var buy = this.data.buyCount;
      this.setData({
        buyCount: buy
      })
    }
  },
  //展开类目
  showGoodType: function (e) {
    var animation = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(960).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
    }.bind(this), 200)
    this.setData({
      show: true,
      pagehid: "hidden",
      height: "100%"
    })
    var that = this;
    //默认选中jk
    var details = this.data.details;
    for (var i = 0; i < details.colors.length; i++) {
      for (var j = 0; j < details.colors[i].skus_2_0.length; j++) {
        if (that.data.spec) {
          if (that.data.size == details.colors[i].color && that.data.stockNumber == details.colors[i].stockNumber) {
            console.log(i)
            let bacBtn = "details.colors[" + i + "].bacBtn";
            let bacColor = "details.colors[" + i + "].bacColor";
            let colors = "details.colors[" + i + "].colors";
            this.setData({
              [bacBtn]: true,
              [bacColor]: '#E61A23',
              [colors]: '#fff',
            })
            //this.setData(this.data);
            let sId = details.colors[i].skus_2_0[j].sku;
            let keys = Object.keys(sId)[0];
            var spec = details.colors[i].skus_2_0[j].sku[keys];
            if (that.data.spec == spec) {
              let bacBtn = "details.colors[" + i + "].skus_2_0[" + j + "].bacBtn";
              let bacColor = "details.colors[" + i + "].skus_2_0[" + j + "].bacColor";
              let colors = "details.colors[" + i + "].skus_2_0[" + j + "].colors";
              let sId = details.colors[i].skus_2_0[j].sku;
              let keys = Object.keys(sId)[0];
              let skuId = "details.colors[" + i + "].skus_2_0[" + j + "].skuId";
              this.setData({
                [bacBtn]: true,
                [bacColor]: '#E61A23',
                [colors]: '#fff',
                [skuId]: keys
              })
              this.setData({
                selectOrderSize: that.data.details.colors[i].skus_2_0[j]
              });
            } else {
              let bacBtn = "details.colors[" + i + "].skus_2_0[" + j + "].bacBtn";
              let bacColor = "details.colors[" + i + "].skus_2_0[" + j + "].bacColor";
              let colors = "details.colors[" + i + "].skus_2_0[" + j + "].colors";
              this.setData({
                [bacBtn]: false,
                [bacColor]: '',
                [colors]: '',
              })
            }
            that.setData({
              selectSize: that.data.details.colors[i].skus_2_0,
              sizeView: true
            });
          } else {
            let bacBtn = "details.colors[" + i + "].bacBtn";
            let bacColor = "details.colors[" + i + "].bacColor";
            let colors = "details.colors[" + i + "].colors";
            this.setData({
              [bacBtn]: false,
              [bacColor]: '',
              [colors]: '',
            })
          }
          this.setData(this.data);
        } else {
          let bacBtn = "details.colors[" + i + "].bacBtn";
          let bacColor = "details.colors[" + i + "].bacColor";
          let colors = "details.colors[" + i + "].colors";
          this.setData({
            [bacBtn]: false,
            [bacColor]: '',
            [colors]: '',
          })
          that.setData({
            selectSize: that.data.details.colors[i].skus_2_0,
            sizeView: true
          });
          this.setData(this.data);
        }

      }
    }
    //默认选中jk
  },
  /**
   * 登录方法
   */
  bindGetUserInfo: function (e) {
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    var FunId = e.currentTarget.id;
    var AccountTokenGet = wx.getStorageSync('AccountTokenGet')
    console.log("AccountTokenGet--->", AccountTokenGet)
    if (!app.utils.isEmpty(AccountTokenGet)) {
      wx.hideLoading();
      // 如果已经登录过直接走方法
      if (FunId == '3' || FunId == 3) {
        that.shopCar();
      } else {
        that.setStatus(FunId);
      }
    } else {
      wx.login({
        success: res => {
          let jscode = res.code;
          var openIdUrl = app.urls.getOpenId + "?Code=" + res.code;
          wx.request({
            url: openIdUrl,
            method: 'get',
            header: {
              'content-type': 'application/json', // 默认值
              'Channel': 'UA',
              'CallSource': 'XCX',
              'DeviceCode': '',
            },
            success: function (res) {
              if (res.data.code == '0') {
                var obj = {};
                obj.openid = res.data.data.openid;
                var pc = new WXBizDataCrypt(app.globalData.AppId, res.data.data.session_key)
                var datail = e.detail;
                if (datail.errMsg == 'getUserInfo:fail auth deny' || datail.errMsg == 'getUserInfo:fail auth cancel') {
                  wx.hideLoading();
                  wx.showToast({
                    title: '授权失败！',
                    icon: 'none',
                    duration: 2000
                  })
                  return;
                }
                var data = pc.decryptData(datail.encryptedData, datail.iv)
                console.log('解密后 data: ', data)
                if (data == undefined || data == 'undefined' || data.unionId == undefined || data.unionId == 'undefined') {
                  // 获取用户信息
                  wx.getUserInfo({
                    success: function (info) {
                      console.log(info);
                      var data = pc.decryptData(info.encryptedData, info.iv);
                      obj.unionid = data.unionId;
                      obj.gender = data.gender;
                      obj.nickName = data.nickName;
                      obj.avatarUrl = data.avatarUrl;
                      if (obj.unionid == undefined || obj.unionid == 'undefined') {
                        wx.hideLoading();
                        wx.showToast({
                          title: '解析数据失败,请重新授权！',
                        })
                        return;
                      }
                      wx.setStorageSync('weixinUserInfo', obj);
                      var obj2 = {
                        UnionId: obj.unionid,
                        OpenId: obj.openid,
                        Sex: String(obj.gender),
                        NickName: obj.nickName,
                        Avatar: obj.avatarUrl
                      }
                      that.loginFun(obj2, FunId);
                    },
                    fail: function () {
                      wx.hideLoading();
                    }
                  })
                } else {
                  obj.unionid = data.unionId;
                  obj.gender = data.gender;
                  obj.nickName = data.nickName;
                  obj.avatarUrl = data.avatarUrl;
                  wx.setStorageSync('weixinUserInfo', obj);
                }
                var obj2 = {
                  UnionId: obj.unionid,
                  OpenId: obj.openid,
                  Sex: String(obj.gender),
                  NickName: obj.nickName,
                  Avatar: obj.avatarUrl
                }
                that.loginFun(obj2, FunId);
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 1500
                })
              }
            },
            fail: function () {
              wx.showToast({
                title: '获取用户失败！',
                icon: 'none',
                duration: 1000
              })
            }
          });
        },
        fail: res => {
          wx.showToast({
            title: '微信登录失败！',
            icon: 'none',
            duration: 1000
          })
        }
      });
    }
  },

  /**
   * 登录方法
   */
  loginFun: function (obj, FunId) {
    var obj = obj;
    console.log(JSON.stringify(obj))
    // 发送登录请求
    var that = this;
    wx.request({
      url: app.urls.userLogin,
      method: 'POST',
      data: obj,
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res);
        wx.hideLoading();
        //判断是否绑定手机号
        if (res.data.code == '0' || res.data.code == '2') { // 已经绑定 //code=2，就是手机号为空
          var user_id = res.data.data.userId;
          wx.setStorageSync('userId', user_id);
          // 获取token
          wx.request({
            url: app.urls.AccountTokenGet + '?UnionId=' + obj.UnionId,
            method: 'get',
            header: {
              'content-type': 'application/json', // 默认值
              'Channel': 'UA',
              'CallSource': 'XCX',
              'DeviceCode': '',
            },
            success: function (res) {
              if (res.data.code == '0') {
                wx.setStorageSync('AccountTokenGet', res.data.data);
                if (!app.utils.isEmpty(res.data.data.userId)) {
                  // 先获取购物车数量
                  app.shopNumber(that);
                  //如果已经注册过手机号直接走方法
                  if (FunId == '3' || FunId == 3) {
                    that.shopCar();
                  } else {
                    that.setStatus(FunId);
                  }
                }
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 1000
                })
              }
            },
            fail: function () {
              wx.hideLoading();
              wx.showToast({
                title: 'Token获取失败！',
                icon: 'none',
                duration: 1000
              })
            }
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '登录失败！',
          icon: 'none',
          duration: 1000
        })
      }
    })
  },
  //添加购物车和立即结算
  setStatus: function (id) {
    var that = this;
    var isError = false;
    var price = this.data.details.sellPriceB;
    if (id == "0") { //添加购物车
      console.log("添加购物车")
      // xxxxx
      this.setData({
        off: true
      })
      var ishasgoods = false; //是否已选择类目
      if (this.data.show == false) { //未展开类目，则打开类目
        var animation = wx.createAnimation({
          duration: 400,
          timingFunction: "linear",
          delay: 0
        })
        this.animation = animation
        animation.translateY(960).step()
        this.setData({
          animationData: animation.export(),
          showModalStatus: true
        })
        setTimeout(function () {
          animation.translateY(0).step()
          this.setData({
            animationData: animation
          })
        }.bind(this), 200)
        this.setData({
          show: true,
          pagehid: "hidden",
          height: "100%"
        })
        //默认选中jk
        var details = this.data.details;
        for (var i = 0; i < details.colors.length; i++) {
          for (var j = 0; j < details.colors[i].skus_2_0.length; j++) {
            if (that.data.spec) {
              // let sId = details.colors[i].skus_2_0[j].sku;
              // let keys = Object.keys(sId)[0];
              if (that.data.size == details.colors[i].color && that.data.stockNumber == details.colors[i].stockNumber) {
                details.colors[i].bacBtn = true;
                details.colors[i].bacColor = "#E61A23";
                details.colors[i].colors = "#fff";
                let bacBtn = "details.colors[" + i + "].bacBtn";
                let bacColor = "details.colors[" + i + "].bacColor";
                let colors = "details.colors[" + i + "].colors";
                this.setData({
                  [bacBtn]: true,
                  [bacColor]: '#E61A23',
                  [colors]: '#fff',
                })
                let sId = details.colors[i].skus_2_0[j].sku;
                let keys = Object.keys(sId)[0];
                var spec = details.colors[i].skus_2_0[j].sku[keys];
                if (that.data.spec == spec) {
                  let bacBtn = "details.colors[" + i + "].skus_2_0[" + j + "].bacBtn";
                  let bacColor = "details.colors[" + i + "].skus_2_0[" + j + "].bacColor";
                  let colors = "details.colors[" + i + "].skus_2_0[" + j + "].colors";
                  let sId = details.colors[i].skus_2_0[j].sku;
                  let skuId = "details.colors[" + i + "].skus_2_0[" + j + "].skuId";
                  this.setData({
                    [bacBtn]: true,
                    [bacColor]: '#E61A23',
                    [colors]: '#fff',
                    [skuId]: Object.keys(sId)[0]
                  })
                  this.setData({
                    selectOrderSize: that.data.details.colors[i].skus_2_0[j]
                  });
                } else {
                  let bacBtn = "details.colors[" + i + "].skus_2_0[" + j + "].bacBtn";
                  let bacColor = "details.colors[" + i + "].skus_2_0[" + j + "].bacColor";
                  let colors = "details.colors[" + i + "].skus_2_0[" + j + "].colors";
                  let sId = details.colors[i].skus_2_0[j].sku;
                  let skuId = "details.colors[" + i + "].skus_2_0[" + j + "].skuId";
                  this.setData({
                    [bacBtn]: false,
                    [bacColor]: '',
                    [colors]: '',
                  })
                }
                that.setData({
                  selectSize: that.data.details.colors[i].skus_2_0,
                  sizeView: true
                });

              } else {
                let bacBtn = "details.colors[" + i + "].bacBtn";
                let bacColor = "details.colors[" + i + "].bacColor";
                let colors = "details.colors[" + i + "].colors";
                this.setData({
                  [bacBtn]: false,
                  [bacColor]: '',
                  [colors]: '',
                })
              }
              this.setData(this.data);
            } else {
              let bacBtn = "details.colors[" + i + "].bacBtn";
              let bacColor = "details.colors[" + i + "].bacColor";
              let colors = "details.colors[" + i + "].colors";
              this.setData({
                [bacBtn]: false,
                [bacColor]: '',
                [colors]: '',
              })
              that.setData({
                selectSize: that.data.details.colors[i].skus_2_0,
                sizeView: true
              });
              this.setData(this.data);
            }

          }
        }
        //默认选中jk

      } else if (this.data.show == true) { //已展开类目
        for (var i = 0; i < this.data.details.colors.length; i++) {
          if (this.data.details.colors[i].bacBtn == true && this.data.selectOrderSize.bacBtn == true) { //判断有无选中类目和尺寸
            ishasgoods = true;
            var obj = {
              StoreId: this.data.details.storeId, // 店铺ID
              SkuId: this.data.selectOrderSize.skuId,
              Count: this.data.buyCount,
            }
            console.log(JSON.stringify(obj))
            // 获取token
            var AccessTokey = wx.getStorageSync("AccountTokenGet");
            var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
            var that = this;
            wx.request({
              url: app.urls.goodsAdd,
              method: 'POST',
              data: obj,
              header: {
                'content-type': 'application/json', // 默认值
                'Authorization': token,
                'Channel': 'UA',
                'CallSource': 'XCX',
                'DeviceCode': '',
              },
              success: function (res) {
                if (res.data.code == "0") {
                  mta.Event.stat("add_shop_car")
                  mta.Event.stat('zhuanqujiarugou', {
                    'addshopcar': 'true'
                  })
                  mta.Event.stat('danpinjiarugouw', {
                    'partsaddshopcar': 'true'
                  })
                  mta.Event.stat('remaishangpinji', {
                    'hotaddshopcar': 'true'
                  })
                  setTimeout(function () {
                    wx.showToast({
                      title: "加入购物车成功",
                      icon: "success",
                      duration: 2000
                    })
                  }, 500)

                  //setTimeout(function () {thisapp.shopNumber()}, 6000);
                  setTimeout(function () {
                    app.shopNumber(that);
                  }, 10)

                } else {
                  isError = true;
                  wx.showToast({
                    title: res.data.message,
                    icon: "none",
                    duration: 3000
                  })
                }
              },
              complete: function (com) {
                //token过期
                if (com.statusCode == 401) {
                  // 重新获取token
                  app.funGetToken();
                }
              }
            })
            var animation = wx.createAnimation({
              duration: 200,
              timingFunction: "linear",
              delay: 0
            })
            this.animation = animation
            animation.translateY(960).step()
            this.setData({
              animationData: animation.export(),
            })
            setTimeout(function () {
              animation.translateY(0).step()
              this.setData({
                animationData: animation.export(),
                showModalStatus: false
              })
            }.bind(this), 200)
            this.setData({
              show: false,
              pagehid: "auto",
              height: ""
            })

          }
        }
        if (this.data.show && !ishasgoods) {
          wx.showToast({
            title: "请选择类目和尺寸",
            icon: "none",
            duration: 4000
          })
        }
      }
    } else if (id == "1") //立即结算	
    {
      if (this.data.show == false) {
        //默认选中jk
        var details = this.data.details;
        for (var i = 0; i < details.colors.length; i++) {
          for (var j = 0; j < details.colors[i].skus_2_0.length; j++) {
            if (that.data.spec) {
              // let sId = details.colors[i].skus_2_0[j].sku;
              // let keys = Object.keys(sId)[0];
              if (that.data.size == details.colors[i].color && that.data.stockNumber == details.colors[i].stockNumber) {
                details.colors[i].bacBtn = true;
                details.colors[i].bacColor = "#E61A23";
                details.colors[i].colors = "#fff";
                let bacBtn = "details.colors[" + i + "].bacBtn";
                let bacColor = "details.colors[" + i + "].bacColor";
                let colors = "details.colors[" + i + "].colors";
                this.setData({
                  [bacBtn]: true,
                  [bacColor]: '#E61A23',
                  [colors]: '#fff',
                })
                let sId = details.colors[i].skus_2_0[j].sku;
                let keys = Object.keys(sId)[0];
                var spec = details.colors[i].skus_2_0[j].sku[keys];
                if (that.data.spec == spec) {
                  let bacBtn = "details.colors[" + i + "].skus_2_0[" + j + "].bacBtn";
                  let bacColor = "details.colors[" + i + "].skus_2_0[" + j + "].bacColor";
                  let colors = "details.colors[" + i + "].skus_2_0[" + j + "].colors";
                  let sId = details.colors[i].skus_2_0[j].sku;
                  let skuId = "details.colors[" + i + "].skus_2_0[" + j + "].skuId";
                  this.setData({
                    [bacBtn]: true,
                    [bacColor]: '#E61A23',
                    [colors]: '#fff',
                    [skuId]: Object.keys(sId)[0]
                  })
                  this.setData({
                    selectOrderSize: that.data.details.colors[i].skus_2_0[j]
                  });
                } else {
                  let bacBtn = "details.colors[" + i + "].skus_2_0[" + j + "].bacBtn";
                  let bacColor = "details.colors[" + i + "].skus_2_0[" + j + "].bacColor";
                  let colors = "details.colors[" + i + "].skus_2_0[" + j + "].colors";
                  let sId = details.colors[i].skus_2_0[j].sku;
                  let skuId = "details.colors[" + i + "].skus_2_0[" + j + "].skuId";
                  this.setData({
                    [bacBtn]: false,
                    [bacColor]: '',
                    [colors]: '',
                  })
                }
                that.setData({
                  selectSize: that.data.details.colors[i].skus_2_0,
                  sizeView: true
                });

              } else {
                let bacBtn = "details.colors[" + i + "].bacBtn";
                let bacColor = "details.colors[" + i + "].bacColor";
                let colors = "details.colors[" + i + "].colors";
                this.setData({
                  [bacBtn]: false,
                  [bacColor]: '',
                  [colors]: '',
                })
              }
              this.setData(this.data);
            } else {
              let bacBtn = "details.colors[" + i + "].bacBtn";
              let bacColor = "details.colors[" + i + "].bacColor";
              let colors = "details.colors[" + i + "].colors";
              this.setData({
                [bacBtn]: false,
                [bacColor]: '',
                [colors]: '',
              })
              that.setData({
                selectSize: that.data.details.colors[i].skus_2_0,
                sizeView: true
              });
              this.setData(this.data);
            }

          }
        }
        //默认选中jk
        var animation = wx.createAnimation({
          duration: 400,
          timingFunction: "linear",
          delay: 0
        })
        this.animation = animation
        animation.translateY(900).step()
        this.setData({
          animationData: animation.export(),
          showModalStatus: true
        })
        setTimeout(function () {
          animation.translateY(0).step()
          this.setData({
            animationData: animation
          })
        }.bind(this), 200)
        this.setData({
          show: true,
          pagehid: "hidden",
          height: "100%"
        })

      } else if (this.data.show == true) {
        var hasChosed = false;
        for (var i = 0; i < this.data.details.colors.length; i++) {
          // 选择了颜色并且选择尺寸
          if (this.data.details.colors[i].bacBtn == true) {
            hasChosed = true;
            if (this.data.selectOrderSize == undefined || this.data.selectOrderSize == '') {
              wx.showToast({
                title: "请选择类目和尺寸",
                icon: "none",
                duration: 3000
              })
              break;
            } else if (this.data.selectOrderSize.bacBtn == true) {
              var skuId = this.data.details.colors[i].id;
              var totalAmount = String(this.data.buyCount * price);
              // 类型
              var obj = {
                OrderType: 'ONLINE',
                Products: [{
                  Count: this.data.buyCount,
                  SkuId: this.data.selectOrderSize.skuId,
                  Storeid: this.data.details.storeId
                }]
              }
              var sss = JSON.stringify(obj);
              console.log(sss)
              // 获取token
              var AccessTokey = wx.getStorageSync("AccountTokenGet");
              var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
              var that = this;
              // 提交时间过长加上Loading
              wx.showLoading({
                title: '加载中',
                mask: true,
              })
              wx.request({
                url: app.urls.orderTempAdd,
                method: 'POST',
                data: obj,
                header: {
                  'content-type': 'application/json', // 默认值
                  'Authorization': token,
                  'Channel': 'UA',
                  'CallSource': 'XCX',
                  'DeviceCode': '',
                },
                success: function (res) {
                  console.log("res", res.data)
                  wx.hideLoading();
                  if (res.data.code == "0") {
                    var userId = wx.getStorageSync("userId");
                    app.GetPhoneNoFun(userId).then(data => {
                      if (data == '已绑定') {
                        wx.navigateTo({
                          url: '../temOrder/temOrder?tempOrderId=' + res.data.data
                        })
                      } else {
                        var weixinUserInfo = wx.getStorageSync("weixinUserInfo");
                        wx.navigateTo({
                          url: '../register/register?userId=' + userId + '&unionid=' +
                            weixinUserInfo.unionid + '&openId=' + weixinUserInfo.openid + '&sqlid=' + '' + '&deviceid=' + '' + '&isQRCodeLogin=' + false + '&back=tempOrder' + '&tempOrderId=' + res.data.data
                        })
                      }
                    });
                  } else if (res.data.code == "1001") {
                    wx.showToast({
                      title: "库存不足",
                      icon: "none",
                      duration: 3000
                    })
                  } else {
                    wx.showToast({
                      title: res.data.message,
                      icon: "none",
                      duration: 3000
                    })
                  }
                },
                complete: function (com) {
                  //token过期
                  if (com.statusCode == 401) {
                    // 重新获取token
                    app.funGetToken();
                  }
                }
              })

              var animation = wx.createAnimation({
                duration: 200,
                timingFunction: "linear",
                delay: 0
              })
              this.animation = animation
              animation.translateY(960).step()
              this.setData({
                animationData: animation.export(),
              })
              setTimeout(function () {
                animation.translateY(0).step()
                this.setData({
                  animationData: animation.export(),
                  showModalStatus: false
                })
              }.bind(this), 200)
              this.setData({
                show: false,
                pagehid: "auto",
                height: ""
              })
            } else {
              wx.showToast({
                title: "请选择类目和尺寸",
                icon: "none",
                duration: 3000
              })
              break;
            }
            //wx.showToast({
            //title: "",
            //icon: "success",
            //duration: 3000
            //})
          }
        }
        if (this.data.show && !hasChosed) {
          wx.showToast({
            title: "请选择类目和尺寸",
            icon: "none",
            duration: 3000
          })
        }
      }
    }

  },
  //添加购物车结束
  setModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(960).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
    this.setData({
      show: false,
      pagehid: "auto",
      height: ""
    })
  },
  setModal: function (e) {
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
    if (e.currentTarget.dataset.status == 1) {
      this.setData({
        showModal: true
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showModal: false
        });
      }
    }.bind(this), 100)
  },
  shopCar: function () {
    this.setData({
      btnoff: true
    })
    var btnoff = this.data.btnoff;
    if (btnoff) {
      wx.switchTab({
        url: '../shoppingCart/shoppingCart'
      })
      this.setData({
        btnoff: false
      })
    }
  },
})
