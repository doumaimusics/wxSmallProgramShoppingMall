//获取应用实例
const app = getApp()
var QR = require("../../../utils/qrcode.js");

Page({
  data: {
    visible: false,
    canvasHidden: false,
    cardInfo: {
      logo_img: "https://api.fansnew.com/uploads/2019-03-19/20190319103303674.png", //logo图(需要https图片路径)
      pic_img: "", //商品图(需要https图片路径)
      code_img: "", //二维码图片(需要https图片路径)
      pic_title: "", //商品标题
      pic_price: "", //商品价格
    }
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      productId: options.GoodsID,
      storeId: options.StoreID
    })
    var shareCodePath = "";
    if (options.sign == 1) {
      shareCodePath = `https://wx.3dculab.com/uaxcx/details/GoodsID|${options.GoodsID}|StoreID|${options.StoreID}`
      var size = this.setCanvasSize();
      this.createQrCode(shareCodePath, "shareCanvas", size.w, size.h, this, (img) => {
        console.log("img",img)
        this.setData({
          productId: options.GoodsID,
          storeId: options.StoreID,
          shareCode: img
        })
        this.loadPage(() => {
          const {
            pageData
          } = this.data
          this.setData({
            'cardInfo.pic_img': pageData.qualityImages[0],
            'cardInfo.pic_title': pageData.shoeName,
            'cardInfo.pic_price': pageData.sellPriceB,
            'cardInfo.code_img': this.data.shareCode
          })
          this.setData({
            visible: true
          })
        })
      });
    } else {
      shareCodePath = `http://partner.fansnew.com/UAPJS/QRcode/GoodsID|${options.GoodsID}|StoreID|${options.StoreID}`
      console.log(shareCodePath)
      var size = this.setCanvasSize();
      this.createQrCode(shareCodePath, "shareCanvas", size.w, size.h, this, (img) => {
        this.setData({
          productId: options.GoodsID,
          storeId: options.StoreID,
          shareCode: img
        })
        this.loadPartPage(() => {
          const {
            pageData
          } = this.data
          this.setData({
            'cardInfo.pic_img': pageData.photo[0],
            'cardInfo.pic_title': pageData.name,
            'cardInfo.pic_price': pageData.sale_price,
            'cardInfo.code_img': this.data.shareCode
          })
          this.setData({
            visible: true
          })
        })
      });
    }
  },
  //动态设置画布大小
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686; //不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width; //canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      wx.showToast({
        title: "获取设备信息失败" + e,
        icon: 'success',
        duration: 1600
      })
    }
    return size;
  },
  //调用插件中的draw方法，绘制二维码图片
  createQrCode: function (url, canvasId, cavW, cavH, that, cb) {
    QR.api.draw(url, canvasId, cavW, cavH, that, '', () => {
      that.canvasToTempImage(cb)
    });
  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function (cb) {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        that.setData({
          imagePath: tempFilePath,
        });
        cb && cb(tempFilePath)
      },
      fail: function (res) {
        console.log("临时二维码路径保存失败", res)
      }
    });
  },

  // 正常详情页信息
  loadPage: function (callback) {
    var productId = this.data.productId;
    var storeId = this.data.storeId;
    var obj = `?productId=${productId}&storeId=${storeId}`;
    var that = this
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
          var pageData = res.data.data;
          console.log(pageData)
          that.setData({
            pageData
          })
          callback && callback()
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
  // 配件详情页
  loadPartPage: function (callback) {
    var productId = this.data.productId;
    var storeId = this.data.storeId;
    var obj = `?productId=${productId}&storeId=${storeId}`;
    var that = this
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
          var pageData = JSON.parse(res.data.data);
          console.log(pageData)
          that.setData({
            pageData
          })
          callback && callback()
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
})
