var app = getApp();
Page({
  
  data: {
    companyIndex:-1,
    arrayCompany: ['顺丰快递', '中通快递', '圆通快递', '申通快递', '韵达快递', '天天快递', '如风达快递', '德邦快递', '邮政快递', 'DHL', 'UPS'],
    orderId: "",
    returnNUM:'',
  },

  onLoad: function (options) {
    var orderid = options.orderid;
    this.setData({
      orderId: orderid
    })
  },
  
  bindPickerChange: function (e) {
    this.data.companyIndex = parseInt(e.detail.value);
    this.data.selectCompany = this.data.arrayCompany[this.data.companyIndex];
    this.setData(this.data);
  },

  onInput:function(e){
    var that = this;
    that.data.returnNUM = e.detail.value;
    that.setData(that.data);
  },

  //提交
  addReturnNum:function(e){
    var that = this;
    var selectCompany = that.data.selectCompany;
    var returnNUM = that.data.returnNUM;
    var orderId = that.data.orderId;
    if (app.utils.isEmpty(orderId)) {
      wx.showToast({
        title: '页面已过期，请重新操作',
        success: function () {
          wx.switchTab({
            url: '/pages/userCenter/index/index'
          })
        }
      })
      return false;
    }

    if (app.utils.isEmpty(selectCompany)) {
      wx.showToast({
        title: '请输入完整信息'
      })
      return false;
    }

    if (app.utils.isEmpty(returnNUM)) {
      wx.showToast({
        title: '请输入完整信息'
      })
      return false;
    }

    var obj = {
      ExpressName: selectCompany,
      ExpressNo: returnNUM,
      OrderId: orderId,
      Remark:""
    }
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.FillExpress,
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
            title: "提交成功!",
            duration: 3000,
            success: function () {
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 3000);
            }
          })
        }
        else {
          wx.showToast({
            title: res.data.message,
          })
        }
      }
    })
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})