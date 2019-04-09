/**
 * 引入MD5
 */
var md5 = require("../../../utils/md5.js");

var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    img1: '../../../resources/imgs/circle1.png',
    img2: '../../../resources/imgs/circle2.png',
    btnoff: true,
    clicktrue: true,
    totalPrice: 0,
    storesqlid: '', //判断是否是扫码进入的临时订单页面
    isStore: false,
    paytype: "2",
    CouponCodeId: '', //优惠券ID默认为0
    CouponCodeBtn: false, //优惠券码按钮禁用
    CouponCodeMsg: '',
    isActive: false,
    couponText: "", // 几折优惠券
    couponItem: "",
    items: [],
    couponsNum: "",
    userInfo: "", //用户信息
    StoreCode:""//新增店铺码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var context = this;
    var userId = wx.getStorageSync("userId");
    var userInfo = wx.getStorageSync('weixinUserInfo');
    console.log("userInfo", userInfo)
    //通过扫码进入临时订单页面
    context.setData({
      add: '',
      userInfo:userInfo,
      isStore: false
    })
    var temporaryOrderURL = decodeURIComponent(options.q);
    //调用获取优惠券的方法
    context.requestGetCoupon();

    if (!app.utils.isEmpty(temporaryOrderURL)) {
      var tem_Split = temporaryOrderURL.split("/"); //分割网址，提取出参数
      var getNewStoreCode = tem_Split[tem_Split.length - 1];  //新增加的店铺对应码参数
      var temporaryOrderID = tem_Split[tem_Split.length - 2]; //获取到临时订单的ID，用于查询
      context.setData({
        tempid: temporaryOrderID,
        StoreCode: getNewStoreCode,
        isStore: true
      })
      var accessTokey = wx.getStorageSync("AccountTokenGet"); //如果是新用户扫码没有登录，那么 //AccountTokenGet为空，导致不能获取到临时订单的信息
      if (accessTokey == null || accessTokey == "") {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 1000
        })
        context.setData({
          isStore: false
        })
        return
      }
    } else { // 非扫码进入

      var TempOrderId = options.tempOrderId;
      var username = options.name;
      var phone = options.phone;
      var cityText = options.city;
      var address = options.street;
      var addressid = options.addressid;
      var provincesid = options.provincesid;
      var cityid = options.cityid;
      var districtid = options.districtid;
      var provincesname = options.provincesname;
      var citys = options.citys;
      var district = options.district;
      var isdefault = options.isdefault
      var btnType = options.type;
      // 如果页面传入的storesqlid有值 则是扫码进入打印
      if (options.storesqlid) {
        context.setData({
          storesqlid: options.storesqlid
        });
      }
      var add = {};
      add.name = username;
      add.mobile = phone;
      add.address = address;
      add.provinceName = provincesname;
      add.cityName = citys;
      add.districtName = district;
      add.id = addressid;
      add.isDefault = isdefault;
      context.setData({
        tempid: TempOrderId,
        add: add,
        isStore: false
      })
    }
    context.orderTempGetOne();
    // 获取地址
    setTimeout(() => {
      context.getAddressFun();
    }, 200)
  },
  //请求获取优惠券列表
  requestGetCoupon() {
    let that = this;
    wx.request({
      url: "https://partner.fansnew.com/miniprogram/discount/code/list?unionid=" + that.data.userInfo.unionid,
      method: 'get',
      success(res) {
        console.log("coupons", res.data.data)
        that.setData({
          items: res.data.data,
          couponsNum: res.data.data.length
        })
      }
    })
  },
  //可使用的优惠券
  handelUsableCoupon() {
    this.setData({
      isActive: !this.data.isActive
    })
  },
  //选择优惠券
  handelSelect(e) {
    let arr = e.detail.value.split('-'),
      couponCodes = arr[0],
      coupons = arr[1];
    console.log(arr, couponCodes, coupons)
    this.setData({
      isActive: false,
      couponText: coupons,
      inputValue: couponCodes
    })
    this.UseCouponCode()
  },
  /**
   * 获取临时订单信息
   */
  orderTempGetOne: function () {
    var context = this;
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    if (AccessTokey == null || AccessTokey == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
      return
    }
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.orderTempGetOne + '?TempOrderId=' + context.data.tempid,
      method: 'get',
      //data: JSON.stringify(obj),
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': token,
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        if (res.data.code == '0') {
          //console.log(res);
          var orderTemp = res.data.data;
          var numbers = 0;
          var totalPrice = 0;
          orderTemp.stores.forEach(function (v, i) {
            v.products.forEach(function (m, n) {
              var z = Number(m.count);
              numbers = numbers + z;
              // 商品总价
              totalPrice += Number(m.count * m.salePrice)
            })
            v.activitys.forEach((item, i) => {
              item.activityPrice = Math.abs(item.activityPrice);
            })
          })
          context.setData({
            totalPrice: totalPrice
          });
          //优惠金额：商品总价 + 运费 - 应付款
          // var discount = Number(totalPrice + orderTemp.stores[0].freight - orderTemp.realPay);
          // context.setData({ discount: discount });
          orderTemp.numbers = numbers;
          context.data.orderTemp = orderTemp;
          context.setData(context.data);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: function (error) {},
      complete: function (com) {
        //token过期
        if (com.statusCode == 401) {
          // 重新获取token
          app.funGetToken();
        }
      }
    })
  },
  /***
   * 获取地址
   */
  getAddressFun: function () {
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    if (AccessTokey == null || AccessTokey == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
      return
    }
    var context = this;
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.getAddressList,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': token,
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        //console.log(res);
        if (res.data.code == '0') {
          var address = res.data.data;
          if (address == null) {
            wx.showToast({
              title: "无地址，请添加地址",
              icon: "none",
              duration: 2000
            })
            // 调用更新地址并重新获取详情接口
            context.updateFungetDetails();
          } else {
            // 排序 将默认地址设为第一个
            var arr = [];
            address.forEach((v, m) => {
              if (v.isDefault == 'True') {
                arr.splice(0, 0, v);
              } else {
                arr.push(v)
              }
            });
            context.data.address = arr;
            context.setData(context.data)
            for (var i = 0; i < context.data.address.length; i++) {
              // ADD已经选择的有值则不用再赋值
              if (context.data.add == undefined || context.data.add.id == undefined) {
                if (context.data.address[i].isDefault == "1") {
                  context.setData({
                    add: context.data.address[i]
                  })
                } else {
                  context.setData({
                    add: context.data.address[0]
                  })
                }
              }
            }
            // 调用更新地址并重新获取详情接口
            if (context.data.add.id != undefined) {
              context.updateFungetDetails();
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
      complete: function (com) {
        //token过期
        if (com.statusCode == 401) {
          // 重新获取token
          app.funGetToken();
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
    var context = this;
    this.setData({
      btnoff: true,
      clicktrue: true
    })
    // 获取地址
    setTimeout(() => {
      context.getAddressFun();
    }, 200)
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
    //下拉重新获取数据
    context.orderTempGetOne();
    context.getAddressFun();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 去支付
   */
  goPay: function (e) {
    var that=this
    var send_qianlian_data = {
      unionid: that.data.userInfo.unionid,
      code: that.data.inputValue,
      // order_id: new_order_info.OrderNo,
      mobile: that.data.orderTemp.addressInfo.mobile,
      money: that.data.orderTemp.realPay
    }
    console.log("send_qianlian_data--->",send_qianlian_data)
    var userId = wx.getStorageSync("userId");
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    console.log("AccessTokey--->",AccessTokey)

    if (AccessTokey == null || AccessTokey == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
      return
    }
    var that = this;
    var btnoff = this.data.btnoff;
    if (this.data.add == undefined || this.data.add.name == undefined) {
      wx.showToast({
        title: "收货地址不能为空",
        icon: "none",
        duration: 3000
      })
      return false;
    }
    if (btnoff) {
      var storeList = this.data.orderTemp.stores;
      var arr = [];
      storeList.forEach(function (m, n) {
        m.products.forEach(function (v, i) {
          var obj2 = {};
          obj2.skuId = v.skuId;
          obj2.count = v.count;
          obj2.storeid = m.storeId;
          arr.push(obj2);
        })
      })
      var obj = {};
      if (that.data.add.name !== undefined) {
        var newObj = {
          StoreId: that.data.orderTemp.stores[0].storeId,
          OrderType: 'ONLINE',
          AddressId: that.data.add.id,
          Remark: '',
          PayId: that.data.tempid,
          PayType: that.data.paytype,
          CouponCode: that.data.CouponCodeId,
          invoiceInfo: {
            receiptTitle: that.data.applynvoice == undefined ? "" : that.data.applynvoice.receiptTtitle,
            receiptContent: that.data.applynvoice == undefined ? "" : that.data.applynvoice.receiptTtitle,
            taxPayerId: that.data.applynvoice == undefined ? "" : that.data.applynvoice.TaxPayerId,
            taxMobile: that.data.applynvoice == undefined ? "" : that.data.applynvoice.TaxMobile,
            taxEmail: that.data.applynvoice == undefined ? "" : that.data.applynvoice.TaxEmail
          },
          productItems: arr
        }
        // 获取token
        var AccessTokey = wx.getStorageSync("AccountTokenGet");
        var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
        var CallSource = that.data.isStore == true ? 'TVWALL' : 'XCX';
        var getStoreCode = that.data.StoreCode//店铺码
        // 提交时间过长加上Loading
        wx.showLoading({
          title: '加载中',
          mask: true,
        })
        console.log(newObj)
        wx.request({
          url: app.urls.orderAdd,
          method: 'POST',
          data: JSON.stringify(newObj),
          header: {
            'content-type': 'application/json', // 默认值
            'Authorization': token,
            'Channel': 'UA',
            'CallSource': CallSource,
            'DeviceCode': getStoreCode,
          },
          success: function (res) {
            // 请求成功生成正式订单了
            if (res.data.code == "0") {
              var new_order = res.data.data.split(','),
                new_order_info = {
                  OrderId: new_order[0],
                  OrderNo: new_order[1]
                };
              console.log("res", new_order_info)
              // 删除购物车数据
              var goodsDelete = [];
              that.data.orderTemp.stores.forEach((v, m) => {
                v.products.forEach((itm, ind) => {
                  var json = {};
                  json.StoreID = v.storeId
                  json.SkuID = itm.skuId;
                  goodsDelete.push(json)
                })
              })
              // 正式订单生成成功 调用购物车删除方法  删除购物车数据
              app.remShoppingCartFun(goodsDelete, '临时订单');
              wx.hideLoading(res);
              // 支付宝支付
              if (that.data.isStore && that.data.paytype == "1") {
                wx.navigateTo({
                  url: '../alipay/alipay'
                })
                return;
              } // 微信支付
              else {
                // 选择微信支付先判断是扫码进入的还是本地支付
                if (that.data.isStore && that.data.paytype == "2") { // isStore==true是扫码进入则需要扫描大屏支付
                  wx.navigateTo({
                    url: '../../userCenter/payCenter/payCenter'
                  })
                  return;
                } else { // 小程序内部支付
                  var weixinUserInfo = wx.getStorageSync("weixinUserInfo");
                  that.setData({
                     userInfo:weixinUserInfo
                  })
                  var openid = weixinUserInfo.openid;
                  var obj = `?OpenId=${openid}&OrderId=${new_order_info.OrderId}`
                  wx.request({
                    url: app.urls.wxPayment + obj, //WxPaymentPrint
                    method: 'get',
                    header: {
                      'content-type': 'application/json', // 默认值
                      'Authorization': token,
                      'Channel': 'UA',
                      'CallSource': 'XCX',
                      'DeviceCode': '',
                    },
                    success: function (ress) {
                      // 将支付的数据存入printingData 用于下面打印获取订单数据
                      //that.setData({ printingData: ress.data.data });
                      var information = JSON.parse(ress.data.data);
                      var timeStamp = information.timeStamp;
                      var nonceStr = information.nonceStr
                      var packages = information.package
                      var signType = information.signType
                      var paySign = information.paySign
                      wx.requestPayment({
                        'timeStamp': timeStamp,
                        'nonceStr': nonceStr,
                        'package': packages,
                        'signType': signType,
                        'paySign': paySign,
                        'success': function (resss) {
                          wx.showToast({
                            title: '支付成功！',
                            icon: "none",
                            duration: 2000
                          })
                        },
                        'fail': function (resss) {
                          wx.showToast({
                            title: '支付失败！',
                            icon: "none",
                            duration: 2000
                          })
                        },
                        'complete': function () {
                          setTimeout(() => {
                            wx.hideLoading();
                            wx.redirectTo({
                              url: '../../userCenter/myOrder/myOrder'
                            })
                          }, 1500);
                        }
                      })
                    },
                    complete: function (com) {
                      //token过期
                      if (com.statusCode == 401) {
                        // 重新获取token
                        app.funGetToken();
                      }
                    }
                  })
                }
              }
            } else {
              that.setData({
                btnoff: true
              })
              wx.showToast({
                title: res.data.message,
                icon: "none",
                duration: 3000
              })
            }
          },
          fail: function (res) {
            wx.showToast({
              title: '加载失败',
              icon: "none",
              duration: 3000
            })
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
      } else {
        wx.showToast({
          title: "收货地址不能为空",
          icon: "none",
          duration: 3000
        })
      }
      this.setData({
        btnoff: false,
        clicktrue: true
      })
    }
  },
  addTxt: function (e) {
    var userId = wx.getStorageSync("userId");
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    if (AccessTokey == null || AccessTokey == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
      return
    }
    var tempOrderId = e.currentTarget.dataset.temporderid;
    var clicktrue = this.data.clicktrue;
    //console.log("当前ID ："+this.data.add.Id);
    var addressid = this.data.add == undefined ? undefined : this.data.add.id
    if (clicktrue) {
      wx.navigateTo({
        url: '../../userCenter/address/address?tempOrderId=' + tempOrderId + '&addressid=' + addressid,
      })
      this.setData({
        clicktrue: true
      })
    }
  },
  // 用户修改了地址则重新获取详情信息
  updateFungetDetails: function () {
    var that = this
    if (that.data.add.id) {
      var obj = {
        TempOrderId: that.data.tempid,
        AddressId: that.data.add.id,
        CouponCode: that.data.CouponCodeId
      }
      //console.log(JSON.stringify(obj));
      // 获取token
      var AccessTokey = wx.getStorageSync("AccountTokenGet");
      var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
      var that = this;
      wx.request({
        url: app.urls.CalculateFreight,
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
          //console.log(res)
          if (res.data.code == '0') {
            that.orderTempGetOne();
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 1500
            })
          }
        },
        complete: function (com) {
          //token过期
          if (com.statusCode == 401) {
            // 重新获取token
            app.funGetToken();
          }
          // setTimeout(() => {
          //   wx.hideLoading();
          // }, 1500);
        }
      })
    }

  },
  // 点击发票进入选择发票页面
  choiceDiscount: function () {
    wx.navigateTo({
      url: '../applyInvoice/applyInvoice?orderid=' + this.data.tempid
    })
  },
  /**
   * 获取打印机
   * 
   */
  getStorePrinter: function () {
    var that = this;
    var obj = {
      storesqlid: that.data.storesqlid
    };
    var objJson = JSON.stringify(obj);
    var objJsonEn = app.utils.AES_Encrypt(objJson);
    // 先获取打印机的信息
    wx.request({
      url: app.urls.getStorePrinter,
      data: {
        param: objJsonEn
      },
      header: {
        'content-type': 'application/json', // 默认值
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      method: 'GET',
      success: function (res) {
        if (res.data.code == '0000') {
          var resuit = res.data.data;
          var partner = resuit.userId; //用户ID
          var apikey = resuit.apiKey; //API密钥
          var machine_code = resuit.printId; //打印机终端号
          var msign = resuit.printKey; //打印机密钥
          var time = parseInt(new Date().getTime() / 1000); //当前时间戳


          var datajson = that.data.printingData;
          //console.log(datajson);
          // 先循环流水单号
          var oddNumbers = "";
          datajson.forEach((item) => {
            oddNumbers += `流水单号：${item.ordershowid}\\n时间：${that.formatDate(item.Created)}\\n`;
          })


          //再次循环商品
          var contentdetail = "";
          datajson.forEach((fatherItem) => {
            fatherItem.Details.forEach((item) => {
              contentdetail += "商品名称：" + item.OrderItemName +
                "\\n类目：" + item.OrderItemId +
                "<table><tr><td>\\n商品单价：" + item.OrderItemPrice + " </td><td></td><td>数量：" + item.OrderItemCount + "\\n</td></tr></table>" +
                "<center>--------------------------------</center>"
            })
          })

          // 最后获得商品总价/优惠券/实付
          var TotalMoney = "";
          datajson.forEach((item) => {
            TotalMoney += `<table><tr><td>商品总价：</td><td></td><td>￥${item.TotalMoney}</td></tr><tr><td>优惠：</td><td></td><td>￥${item.Discount_total}</td></tr></table><center>--------------------------------</center><table><tr><td>实付款</td><td></td><td>￥${item.TotalMoneyReal}</td></tr></table>\\n`;
          })
          var content = "<center>" +
            "<FS>Sanrio Touch</FS>" +
            "</center>\\n" +
            "<center>********************************</center>\\n" +
            oddNumbers +
            contentdetail +
            TotalMoney +
            "<QR>https://wx.3dculab.com/xcx</QR>\\n" +
            "<center>订单查询及售后服务请扫码在小程序中完成</center>";

          var sign = (md5.hexMd5(`${apikey}machine_code${machine_code}partner${partner}time${time}${msign}`)).toUpperCase();
          var dataString = `partner=${partner}&machine_code=${machine_code}&time=${time}&sign=${sign}&content=${encodeURIComponent(content)}`

          var obj = {
            PrinterInfo: dataString
          };
          var objJson = JSON.stringify(obj);
          var objJsonEn = app.utils.AES_Encrypt(objJson);
          objJsonEn = JSON.stringify({
            param: objJsonEn
          });
          // 调用打印接口
          wx.request({
            url: app.urls.GetPrintContent, //仅为示例，并非真实的接口地址
            data: objJsonEn,
            header: {
              'content-type': 'application/json', // 默认值
              'Channel': 'UA',
              'CallSource': 'XCX',
              'DeviceCode': '',
            },
            method: 'POST',
            success: function (res) {
              //console.log(res.data)
              // 在跳转页面
              wx.redirectTo({
                url: '../../userCenter/myOrder/myOrder'
              })
            }
          })

        }
      }
    })
  },
  /**
   * 时间转换方法
   */
  formatDate: function (time) {
    var date = new Date(time);

    var year = date.getFullYear(),
      month = date.getMonth() + 1, //月份是从0开始的
      day = date.getDate(),
      hour = date.getHours(),
      min = date.getMinutes(),
      sec = date.getSeconds();
    var newTime = year + '-' +
      (month < 10 ? '0' + month : month) + '-' +
      (day < 10 ? '0' + day : day) + ' ' +
      (hour < 10 ? '0' + hour : hour) + ':' +
      (min < 10 ? '0' + min : min) + ':' +
      (sec < 10 ? '0' + sec : sec);

    return newTime;
  },
  radioChange: function (e) {
    var paytype = e.detail.value;
    this.setData({
      paytype: paytype
    });
  },
  // 监听优惠码输入事件
  getCouponCode: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  /**
   * 使用优惠码
   */
  UseCouponCode: function (e) {
    var that = this;
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    if (AccessTokey == null || AccessTokey == "") {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
      return
    }
    var tempOrderId = e ? e.currentTarget.dataset.temporderid : that.data.tempid;
    var storeId = e ? e.currentTarget.dataset.storeid : that.data.orderTemp.stores[0].storeId;
    var couponCode = that.data.inputValue;
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    var obj = {
      TempOrderId: tempOrderId,
      StoreId: storeId,
      CouponCode: couponCode
    };
    if (couponCode) {
      that.setData({
        CouponCodeBtn: true
      });
    } else {
      wx.showToast({
        title: '优惠码不能为空！',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.request({
      url: app.urls.UseCouponCode,
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
        if (res.data.code == '0') {
          var couponItems = res.data.message.split('折')
          that.setData({
            CouponCodeId: couponCode, //res.data.data.id,
            CouponCodeBtn: true,
            CouponCodeMsg: res.data.message,
            couponItem: couponItems[0]
          });
          that.orderTempGetOne();
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1500
          })
          that.setData({
            CouponCodeBtn: false
          });
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
  },
})
