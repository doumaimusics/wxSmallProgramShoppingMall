/**
 * 引入MD5
 */
var md5 = require("../../../utils/md5.js");

var app = getApp();
var n = 1;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabArr: {
      tabCurIndex: 0,
      tabCurConIndex: 0,
    },
    off: true,
    orderList: [],
    showlist: false,
    tarid: "0",
    tabFun: false,
    userInfo: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tarid: options.index || 0,
      tabArr: {
        tabCurConIndex: options.index || 0,
        tabCurIndex: options.index || 0
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.showPage();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    var userInfo = wx.getStorageSync("AccountTokenGet");
    console.log("userInfo", userInfo)
    this.setData({
      userInfo
    })
    this.showPage();
    //var that=this;
    // if(n > 1){
    //   var AccessTokey = wx.getStorageSync("AccountTokenGet");
    //   var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    //   var tarid = that.data.tarid;
    //   var dataUrl = '?PageIndex=' + n + '&Keyword&OrderStatus=' + tarid;
    //   wx.request({
    //     url: app.urls.orderGetListCom + dataUrl,
    //     method: 'get',
    //     header: {
    //       'content-type': 'application/json', // 默认值
    //       'Authorization': token,
    //       'Channel': 'UA',
    //       'CallSource': 'XCX',
    //       'DeviceCode': '',
    //     },
    //     success: function (res) {
    //       //console.log(res);
    //       if (res.data.code == '0') {
    //         var orderLists = res.data.data;
    //         if (orderLists.length > 0) {
    //           var text = "等待买家付款";
    //           var orderList = that.data.orderList;
    //           orderList.forEach((v,i)=>{
    //             orderLists.forEach((val, index) => {
    //               // 去详情页的订单id等于最新数据的id
    //               if (v.id == that.data.orderid && that.data.orderid== val.id) {
    //                 var text = that.getOrderStatusText(val.status.toString());
    //                 val.text = text;
    //                 let orderListNum = "orderList[" + i + "]";
    //                 that.setData({
    //                   [orderListNum]: val
    //                 })
    //               }
    //             })
    //           })
    //           that.setData(that.data);
    //         } else {
    //           that.setData({
    //             showlist: true
    //           })
    //         }
    //         that.setData(that.data);
    //         that.setData({
    //           off: true,
    //           tabFun: true
    //         })
    //       } else {
    //         that.setData({
    //           off: false,
    //           tabFun: true,
    //           showlist: true,
    //         })
    //         if (res.data.message == '无订单') {
    //         } else {
    //           wx.showToast({
    //             title: res.data.message,
    //             icon: "none",
    //             duration: 2000
    //           })
    //         }
    //       }
    //     },
    //     complete: function (com) {
    //       //token过期
    //       if (com.statusCode == 401) {
    //         // 重新获取token
    //         app.funGetToken();
    //       }
    //     }
    //   })
    // }

  },

  showPage: function () {
    //var userId = wx.getStorageSync("userId");
    n = 1;
    console.log("页面显示" + n)
    var tarid = this.data.tarid;
    var that = this;
    wx.getSystemInfo({
      success: function (info) {
        that.data.windowHeight = info.windowHeight;
        that.setData(that.data);
        //console.log(that.data.windowHeight);
      }
    });
    var obkurl = '?PageIndex=' + n + '&Keyword&OrderStatus=' + tarid;
    that.funGetListFun(obkurl, that).then((data) => {
      //console.log(data);
      if (!data) {
        that.setData({
          off: true
        })
      }
    });

  },

  /**
   * 请求所有订单方法
   */
  funGetListFun: function (dataUrl, thats) {
    console.log(n);
    var that = thats;
    // if(n==1){
    //   that.setData({
    //     orderList:[]
    //   })
    // }
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    var orderGetList = new Promise(function (resolve, reject) {
      wx.request({
        url: app.urls.orderGetListCom + dataUrl,
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
            var orderLists = res.data.data;
            if (orderLists.length > 0) {
              var messages = res.data.message;
              var text = "等待买家付款"
              that.data.messages = messages;
              orderLists.forEach(function (v, i) {
                var text = that.getOrderStatusText(v.status.toString());
                v.text = text;
              })
              that.setData({
                showlist: false,
                orderList: orderLists,
              })
            } else {
              that.setData({
                showlist: true
              })
            }
            that.setData(that.data);
            that.setData({
              off: false,
              tabFun: true
            })
            resolve(that.data.off);
          } else {
            that.setData({
              off: false,
              tabFun: true,
              showlist: true,
            })
            resolve(that.data.off);
            if (res.data.message == '无订单') {

            } else {
              wx.showToast({
                title: res.data.message,
                icon: "none",
                duration: 2000
              })
            }
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
    })
    return orderGetList;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('页面隐藏' + n);
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
    this.setData({
      showlist: false
    })
    this.showPage();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var tarid = this.data.tarid;
    n = n + 1
    //console.log('加载更多' + n)
    if (n > Number(this.data.messages)) {
      wx.showToast({
        title: "数据加载完全",
        icon: "none",
        duration: 3000
      })
      n = n - 1
      return false;
      // n = Number(this.data.messages)
    } else {
      var AccessTokey = wx.getStorageSync("AccountTokenGet");
      var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
      var obkurl = '?PageIndex=' + n + '&Keyword&OrderStatus=' + tarid;
      wx.request({
        url: app.urls.orderGetListCom + obkurl,
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
            var orderLists = res.data.data;
            var orderListpush = that.data.orderList;
            if (orderLists.length > 0) {
              var messages = res.data.message;
              var text = "等待买家付款"
              that.data.messages = messages;
              orderLists.forEach(function (v, i) {
                var text = that.getOrderStatusText(v.status.toString());
                v.text = text;
                orderListpush.push(v)
              })
              that.setData({
                showlist: false,
                orderList: orderListpush,
              })
            } else {
              that.setData({
                showlist: true
              })
            }
            that.setData({
              off: true,
              tabFun: true
            })
            that.setData(that.data);
            //resolve(that.data.off);
          } else {
            that.setData({
              off: true,
              tabFun: true,
              showlist: true,
            })
            wx.showToast({
              title: res.data.message,
              icon: "none",
              duration: 2000
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

      // that.funGetListFun(obkurl, that).then((data) => {
      //   console.log(data);
      //   if (!data) {
      //     that.setData({
      //       off: true
      //     })
      //   }
      // });
      this.setData({
        isHideLoadMore: true,
      })
    }
    console.log('下拉n=' + n)
  },
  /**
   * tab切换事件
   */
  tabFun: function (e) {
    if (this.data.tabFun) {
      this.setData({
        tabFun: false
      })
      var _datasetId = e.target.dataset.id;
      n = 1
      this.data.orderList = [];
      this.setData({
        orderList: [],
        tarid: _datasetId
      })
      //console.log("---" + _datasetId + "---");
      var _obj = {};
      _obj.tabCurIndex = _datasetId;
      _obj.tabCurConIndex = _datasetId;
      var that = this;
      that.setData({
        tabArr: _obj
      });
      var obkurl = '?PageIndex=1&Keyword&OrderStatus=' + _datasetId;
      that.funGetListFun(obkurl, that).then((data) => {
        console.log(data);
        if (!data) {
          that.setData({
            off: true,
            tabFun: true
          })
        }
      });
    }

  },

  orderCancel: function (e) {
    var that = this;
    wx.showModal({
      content: '是否确认取消订单',
      confirmText: '是',
      cancelText: '否',
      success: function (res) {
        if (res.confirm) {
          that.cancelOrder(e);
        } else if (res.cancel) {

        }
      }
    })
  },
  /**
   * 取消订单
   */
  cancelOrder: function (e) {
    var orderId = e.currentTarget.dataset.orderid;
    n = 1;
    var that = this;
    that.data.orderList = [];
    that.setData({
      orderList: []
    })
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    var obj = {
      OrderId: orderId
    }
    wx.request({
      url: app.urls.orderCancel,
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
        // console.log(res.data)
        if (res.data.code == "0") {
          var userId = wx.getStorageSync("userId");
          wx.showToast({
            title: res.data.message,
            icon: "none",
            duration: 3000
          })
          //重新获取一下
          var tarid = that.data.tarid;
          var obkurl = '?PageIndex=' + n + '&Keyword&OrderStatus=' + tarid
          that.funGetListFun(obkurl, that).then((data) => {
            console.log(data);
            if (!data) {
              that.setData({
                off: true
              })
            }
          });
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

  },
  getOrderStatusText: function (orderStatus) {
    var retText = "";
    switch (orderStatus) {
      case "101":
        retText = "等待买家付款";
        break;
      case "105":
        retText = "等待卖家发货";
        break;
      case "106":
        retText = "申请退款";
        break;
      case "115":
        retText = "待收货";
        break;
      case "120":
        retText = "交易完成";
        break;
      case "124":
        retText = "申请退款成功";
        break;
      case "125":
        retText = "已取消";
        break;
      case "126":
        retText = "申请退款成功";
        break;
      case "127":
        retText = "已退款";
        break;
      case "129":
        retText = "申请退货";
        break;
      case "130":
        retText = "申请退货成功";
        break;
      case "131":
        retText = "已退货";
        break;
      case "132":
        retText = "退货完成";
        break;
      case "133":
        retText = "买家已退货";
        break;
      default:
        retText = "已关闭";
    }
    return retText;
  },
  makeCall: function () {
    wx.makePhoneCall({
      phoneNumber: '400-838-8931'
    })
  },

  payment: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.orderid;
    var ordersource = e.currentTarget.dataset.ordersource;
    var payType = e.currentTarget.dataset.payType;
    var payAmount = e.currentTarget.dataset.payamount;
    var user = wx.getStorageSync("weixinUserInfo");
    console.log("支付第一步", e)
    // 获取token
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    var openid = user.openid;
    var obj = `?OpenId=${openid}&OrderId=${orderId}`
    wx.request({
      url: app.urls.wxPayment + obj,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': token,
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log("支付第二步", e)
        // 将支付的数据存入printingData 用于下面打印获取订单数据
        if (ordersource == 'ONLINE') { //线上订单直接在小程序内部支付
          var information = JSON.parse(res.data.data);
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
            'success': function (ress) {
              wx.showToast({
                title: '支付成功',
                icon: 'none',
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
          })
        } else { // 线下订单就走选择支付将数据传入
          wx.navigateTo({
            url: '../paymentSelect/paymentSelect?orderId=' + orderId + '&payType=' + payType
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
   * 订单详情
   */
  orderDetails: function (e) {
    var orderid = e.currentTarget.dataset.orderid
    var off = this.data.off;
    if (off) {
      this.setData({
        orderid: orderid
      })
      wx.navigateTo({
        url: '../orderDetails/orderDetails?orderid=' + orderid,
      })
      this.setData({
        off: false
      })
    }
  },
  //申请退款
  refundApply: function (e) {
    var orderid = e.currentTarget.dataset.orderid;
    var amount = e.currentTarget.dataset.amount;
    wx.navigateTo({
      url: '../refundReturn/refundView?orderid=' + orderid + '&amount=' + amount,
    })
  },
  //确认收货
  confirmReceive: function (e) {
    var that = this;
    wx.showModal({
      content: '是否确认收货',
      confirmText: '是',
      cancelText: '否',
      success: function (res) {
        if (res.confirm) {
          var orderId = e.currentTarget.dataset.orderid;
          var obj = {
            OrderId: orderId
          };
          var AccessTokey = wx.getStorageSync("AccountTokenGet");
          var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
          wx.request({
            url: app.urls.ConfirmReceipt,
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
              console.log(res.data)
              if (res.data.code == "0") {
                wx.showToast({
                  title: "收货成功",
                  duration: 3000,
                  success: function () {
                    var obkurl = '?PageIndex=1&Keyword&OrderStatus=115'
                    that.funGetListFun(obkurl, that).then((data) => {
                      console.log(data);
                      if (!data) {
                        that.setData({
                          off: true,
                          tabFun: true
                        })
                      }
                    });
                    // that.data.orderList.forEach(function (v, i) {
                    //   if (v.id == orderId) {
                    //     v.order_status = 120;
                    //     v.text = "交易完成";
                    //   }
                    // })
                    // that.setData(that.data);
                  }
                })
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 2000,
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
        } else if (res.cancel) {

        }
      }
    })
  },
  //申请退货
  returnApply: function (e) {
    var orderid = e.currentTarget.dataset.orderid;
    var amount = e.currentTarget.dataset.amount;
    wx.navigateTo({
      url: '../refundReturn/returnView?orderid=' + orderid + '&amount=' + amount,
    })

  },
  //填写退货物流单号
  addReturnNUM: function (e) {
    var orderid = e.currentTarget.dataset.orderid
    wx.navigateTo({
      url: '../refundReturn/addReturnNum?orderid=' + orderid,
    })
  },


  /**
   * 获取打印机
   * 
   */
  getStorePrinter: function () {
    var that = this;
    var obj = {
      storesqlid: that.data.printingData[0].SqlId
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
                //"\\n商品单价：" + item.OrderItemPrice + "           数量：" + item.OrderItemCount + "\\n" +
                "<center>--------------------------------</center>"
            })
          })

          // 最后获得商品总价/优惠券/实付
          var TotalMoney = "";
          datajson.forEach((item) => {
            // TotalMoney += `商品总价：               ￥${item.TotalMoney}\\n优惠：                   ￥${item.Discount_total}\\n<center>--------------------------------</center>\\n实付款                   ￥${item.TotalMoneyReal}\\n\\n`;
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
              console.log(res.data)

            }
          })

        } else {
          wx.showToast({
            title: res.data.message,
            icon: "none",
            duration: 2000
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
  //申请发票
  applyInvoice: function (e) {
    // 查看开票信息
    var obj = {
      OrderId: e.target.dataset.orderid
    };
    var objJson = JSON.stringify(obj);
    var objJsonEn = app.utils.AES_Encrypt(objJson);
    objJsonEn = encodeURIComponent(objJsonEn);
    // 获取店铺优惠券列表
    var that = this;
    // app.request(this, app.urls.GetOrderInvoice, 'get', objJsonEn, function (context, res) {
    //   console.log(res);
    //   if (res.code == '0000') {
    //     // 没有数据即没有申请过发票
    //     if (res.data == null){
    //       wx.navigateTo({
    //         url: '../../info/applyInvoice/applyInvoice?orderid=' + e.target.dataset.orderid
    //       })
    //     }else{
    //       wx.showToast({
    //         title: "不可重复开票",
    //         icon: 'success',
    //         duration: 1500
    //       })
    //     }
    //   } 
    // })

  },
})
