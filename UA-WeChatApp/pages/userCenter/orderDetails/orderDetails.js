var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    expressArray: {},
    logisticsDetail: '暂无物流信息',
    logisticsTime: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderid = options.orderid;
    //加载时隐藏货运信息
    // var hide = "orderDetail.status";
    this.setData({
      orderid: orderid,
      // "orderDetail.status":'101'
    });
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
    var that = this;
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.orderGetDetailById + '?orderID=' + that.data.orderid,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': token,
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        //console.log(JSON.stringify(res.data.data) );
        if (res.data.code == '0') {
          var orderDetail = res.data.data;
          var track = orderDetail.logisticsInfo.track
          var logisticsDetail = track == null || track == 'null' ? '暂无物流信息' : track[track.length - 1];
          orderDetail.activities.forEach((v, i) => {
            v.activityPrice = Math.abs(v.activityPrice);
          })
          that.data.logisticsDetail = logisticsDetail;
          orderDetail.discountAmount = Math.abs(orderDetail.discountAmount);
          that.data.orderDetail = orderDetail;
          switch (orderDetail.status.toString()) {
            case "101":
              orderDetail.text = "等待买家付款";
              break;
            case "105":
              orderDetail.text = "等待卖家发货";
              break;
            case "115":
              orderDetail.text = "待收货";
              break;
            case "120":
              orderDetail.text = "交易完成";
              break;
            case "129":
              orderDetail.text = "申请退货";
              break;
            case "130":
              orderDetail.text = "申请退货成功";
              break;
            case "131":
              orderDetail.text = "已退货";
              break;
            case "132":
              orderDetail.text = "退货完成";
              break;
            case "133":
              orderDetail.text = "买家已退货";
              break;
            case "106":
              orderDetail.text = "申请退款";
              break;
            case "126":
              orderDetail.text = "申请退款成功";
              break;
            case "127":
              orderDetail.text = "已退款";
              break;
            case "124":
              orderDetail.text = "申请退款成功";
              break;
            case "125":
              orderDetail.text = "已取消";
              break;
            default:
              orderDetail.text = "已关闭";
          }
          that.setData(that.data);
          that.GetSendBackInfo();
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
  /**
   * 寄出的收货信息后
   */
  GetSendBackInfo: function () {
    var that = this;
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.GetSendBackInfo + '?orderID=' + that.data.orderid,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': token,
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res);
        //此处获取商家邮寄地址
        if (res.data.code == '0') {
          that.setData({
            GetSendBackInfo: res.data.data
          })
        }
      }
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  // back:function(){
  //   wx.navigateBack()
  // },
  makeCall: function () {
    wx.makePhoneCall({
      phoneNumber: '400-838-8931'
    })
  },

  detailLogistics: function (e) {
    var that = this;
    // if (that.data.logisticsDetail == '暂无物流信息'){
    //   wx.showToast({
    //     title: '暂无物流信息'
    //   })
    //   return false;
    // }
    // 先将对象转成字符串
    var track = JSON.stringify(that.data.orderDetail.logisticsInfo.track);
    //再将字符串转码
    var model = encodeURIComponent(track);
    wx.navigateTo({
      url: '../orderDetails/logisticsDetail?model=' + model
    })

  },
  //取消订单
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

  cancelOrder: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.orderid;

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
        console.log(res.data)
        if (res.data.code == "0") {
          var userId = wx.getStorageSync("userId");
          wx.showToast({
            title: res.data.message,
            icon: "none",
            duration: 3000
          })
          //重新获取一下
          that.onShow();
          var wxCurrPage = getCurrentPages();//获取当前页面的页面栈
          var wxPrevPage = wxCurrPage[wxCurrPage.length - 2];//获取上级页面的page对象
          if (wxPrevPage) {
            //遍历所有订单
            wxPrevPage.data.orderList.forEach(function (T, index) {
              if (T.orderId == orderId) {
                wxPrevPage.data.orderList.splice(index, 1);
              }
            })
            wxPrevPage.setData(
              wxPrevPage.data//baseData为上级页面的某个数据
            )
          }
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

  /**
   * 去支付
   */
  payment: function (e) {
    var that=this
    var orderId = e.currentTarget.dataset.orderid;
    var ordersource = e.currentTarget.dataset.ordersource;
    var payType = e.currentTarget.dataset.payType
    var user = wx.getStorageSync("weixinUserInfo");
    var payAmount = e.currentTarget.dataset.payAmount;
    var orderInfos = "";
    console.log("e", e)
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
        if (ordersource == 'ONLINE') {//线上订单直接在小程序内部支付
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
          });
        } else {// 线下订单就走选择支付将数据传入
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
            orderId: orderId
          };
          var AccessTokey = wx.getStorageSync("AccountTokenGet");
          var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
          wx.request({
            url: app.urls.ConfirmReceipt,
            method: 'POST',
            data: obj,
            header: {
              'content-type': 'application/json',// 默认值
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
                    that.data.orderList.forEach(function (v, i) {
                      if (v.id == orderId) {
                        v.order_status = 120;
                        v.text = "交易完成";
                      }
                    })
                    that.setData(that.data);
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
        } else if (res.cancel) {}
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
})