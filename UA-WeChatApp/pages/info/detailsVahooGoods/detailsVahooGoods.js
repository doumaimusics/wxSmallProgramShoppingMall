var app = getApp();
var util = require('../../../utils/util.js');
var WXBizDataCrypt = require('../../../utils/RdWXBizDataCrypt.js');
var thisapp;
var mta = require('../../../utils/mta_analysis');


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
    buyCount: "1",
    show: false,
    pagehid: "auto",
    height: "",
    btnoff: true,
    productId: "",
    storeId: "",
    sign: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
    var productId = "";
    var storeId = "";
    console.log("options", options)
    if (options.sign && options.sign == 1) {
      this.setData({
        sign: true
      })
    }
    //兼容扫码查看详情    
    if (options.q && options.q !== undefined) {
      var ewm_url = decodeURIComponent(options.q);
      console.log(ewm_url); //打印出url
      var surls = ewm_url.split("/"); //分割网址，提取出参数
      var p = surls[surls.length - 1].split("|"); //最后一个是参数
      console.log(p); //打印出url
      productId = p[1];
      storeId = p[3];
    } else {
      productId = options.GoodsID;
      storeId = options.StoreID;
    }
    this.setData({
      productId: productId,
      storeId: storeId
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
        var details = JSON.parse(res.data.data);
        //console.log(res.data.data);
        if (details.content !== '') {
          that.setData({
            detailInfo: details.content
          });
        }

        var n = 1;
        for (var i = 0; i < details.sku.length; i++) {
          if (details.sku[i].stores[0].quantity <= 0) {
            var bacBtn = false;
            var goodsT = details.sku[i]
            goodsT.bacBtn = false;
            goodsT.bacColor = "#d3d3d3";
            goodsT.colors = "#333";
            that.data.details = details;
            that.setData(that.data)
          } else {
            ++n;
            console.log(n)
            if (n == 2) {
              var bacBtn = true;
              var goodsT = details.sku[i]
              goodsT.bacBtn = true;
              goodsT.bacColor = "#E61A23";
              goodsT.colors = "#333";
              that.setData({
                specSize: details.sku[i].name,
                skuid: details.sku[i].id,
                picture: details.sku[i].picture[0]
              })
              that.data.details = details;
              that.setData(that.data)
            }
          }
        }
        app.shopNumber(that);
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
    app.shopNumber(this);
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    if (app.utils.isEmpty(AccessTokey)) {
      this.setData({
        IsLogin: false
      })
    } else {
      this.setData({
        IsLogin: true
      })
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
    this.loadPage();
    wx.stopPullDownRefresh()

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  //去首页
  go_home() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  // 去分享海报
  go_poster() {
    wx.navigateTo({
      url: `/pages/info/poster/poster?GoodsID=${this.data.productId}&StoreID=${this.data.storeId}&sign=2`
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
      title: this.data.details.name,
      imageUrl: this.data.details.photo[0],
      path: "pages/info/detailsVahooGoods/detailsVahooGoods?GoodsID=" + productId + "&StoreID=" + storeId + "&sign=1",
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
  btntap: function (e) {
    if (this.data.skuid) {
      for (var i = 0; i < this.data.details.sku.length; i++) {
        if (e.currentTarget.dataset.skuid == this.data.details.sku[i].id) {
          if (this.data.details.sku[i].stores[0].quantity == 0) {
            break;
          } else {
            this.data.details.sku[i].bacBtn = true
            var picture = this.data.details.sku[i].picture[0]; // 图片
            var price = this.data.details.sku[i].stores[0].price; // 价格
            this.data.price = price;
            this.data.picture = picture;
            this.data.details.sku[i].bacBtn = true;
            this.data.details.sku[i].bacColor = "#E61A23";
            this.data.details.sku[i].colors = "#fff";
            this.setData({
              specSize: this.data.details.sku[i].name,
              skuid: this.data.details.sku[i].id,
            })
          }
        } else {
          if (this.data.details.sku[i].stores[0].quantity == 0) {
            this.data.details.sku[i].bacBtn = false;
            this.data.details.sku[i].bacColor = "#d3d3d3";
            this.data.details.sku[i].colors = "#333";
          } else {
            this.data.details.sku[i].bacBtn = false;
            this.data.details.sku[i].bacColor = "#fff";
            this.data.details.sku[i].colors = "#333";
          }

        }
      }
      this.setData(this.data)
    }
  },
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
    //默认选中/////////////////llllll
    let selectable = this.data.details.sku
    let specSize = this.data.specSize;
    var skuid = this.data.skuid;
    for (let i = 0; i < selectable.length; i++) {
      if (selectable[i].id == skuid) {
        selectable[i].bacBtn = true;
        selectable[i].bacColor = "#E61A23";
        selectable[i].colors = "#fff";
      } else {
        if (selectable[i].stores[0].quantity == 0) {
          selectable[i].bacBtn = false;
          selectable[i].bacColor = "#d3d3d3";
          selectable[i].colors = "#333";
        } else {
          selectable[i].bacBtn = false;
          selectable[i].bacColor = "#fff";
          selectable[i].colors = "#333";
        }

      }
      this.setData(this.data);
    }
    //默认选中///////////////llllll
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
          var openIdUrl = app.urls.getOpenId + "?code=" + res.code;
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
                console.log('解密后 data: ', data);
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
                          title: '解析数据失败！',
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
                title: '获取Token失败！',
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
    var isError = false;
    var userId = wx.getStorageSync("userId");
    var price = this.data.details.tag_price;
    if (id == "0") { //添加购物车
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
        //默认选中/////////////////llllll
        let selectable = this.data.details.sku
        let specSize = this.data.specSize;
        var skuid = this.data.skuid;
        for (let i = 0; i < selectable.length; i++) {
          if (selectable[i].id == skuid) {
            selectable[i].bacBtn = true;
            selectable[i].bacColor = "#E61A23";
            selectable[i].colors = "#fff";
          } else {
            if (selectable[i].stores[0].quantity == 0) {
              selectable[i].bacBtn = false;
              selectable[i].bacColor = "#d3d3d3";
              selectable[i].colors = "#333";
            } else {
              selectable[i].bacBtn = false;
              selectable[i].bacColor = "#fff";
              selectable[i].colors = "#333";
            }
          }
          this.setData(this.data);
        }
        //默认选中///////////////llllll
      } else if (this.data.show == true) { //已展开类目

        for (var i = 0; i < this.data.details.sku.length; i++) {
          if (this.data.details.sku[i].bacBtn == true) { //判断有无选中类目
            ishasgoods = true;
            var skuId = this.data.details.sku[i].id;
            var obj = {
              StoreID: this.data.details.store_id, // 店铺ID
              SkuID: skuId,
              Count: this.data.buyCount,
            }
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
                  mta.Event.stat('peijianjiarugou-1', {
                    'partsaddshopcar': 'true'
                  })
                  mta.Event.stat('peijianzhuanquj', {
                    'partsaddshopcar': 'true'
                  })
                  mta.Event.stat("add_shop_car", {})
                  setTimeout(function () {
                    wx.showToast({
                      title: "加入购物车成功",
                      icon: "success",
                      duration: 2000
                    })
                  }, 500)
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
            title: "请选择类目",
            icon: "none",
            duration: 4000
          })
        }
      }
    } else if (id == "1") //立即结算	
    {

      if (this.data.show == false) {

        //默认选中/////////////////llllll
        let selectable = this.data.details.sku
        let specSize = this.data.specSize;
        var skuid = this.data.skuid;
        for (let i = 0; i < selectable.length; i++) {
          if (selectable[i].id == skuid) {
            selectable[i].bacBtn = true;
            selectable[i].bacColor = "#E61A23";
            selectable[i].colors = "#fff";
          } else {
            if (selectable[i].stores[0].quantity == 0) {
              selectable[i].bacBtn = false;
              selectable[i].bacColor = "#d3d3d3";
              selectable[i].colors = "#333";
            } else {
              selectable[i].bacBtn = false;
              selectable[i].bacColor = "#fff";
              selectable[i].colors = "#333";
            }
          }
          this.setData(this.data);
        }
        //默认选中///////////////llllll
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

        // 开始发送请求

        for (var i = 0; i < this.data.details.sku.length; i++) {
          if (this.data.details.sku[i].bacBtn == true) {
            hasChosed = true;
            var skuId = this.data.details.sku[i].id;
            var totalAmount = String(this.data.buyCount * price);
            var obj = {
              OrderType: 'ONLINE',
              Products: [{
                Count: this.data.buyCount,
                SkuId: skuId,
                Storeid: this.data.details.store_id
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
                setTimeout(() => {
                  wx.hideLoading();
                }, 3000);
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
            //wx.showToast({
            //title: "",
            //icon: "success",
            //duration: 3000
            //})
          }
        }
        if (this.data.show && !hasChosed) {
          wx.showToast({
            title: "请选择类目",
            icon: "none",
            duration: 3000
          })
        }
      }
    }

  }, //添加购物车结束

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
  shopCar: function (e) {
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
