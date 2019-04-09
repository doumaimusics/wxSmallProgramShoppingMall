// rpx转px
function createRpx2px() {
  const {
    windowWidth
  } = wx.getSystemInfoSync()
  return function (rpx) {
    return windowWidth / 750 * rpx
  }
}
const rpx2px = createRpx2px()

function saveImageToPhotosAlbum(option) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      ...option,
      success: resolve,
      fail: reject,
    })
  })
}

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer(visible) {
        // 当开始显示分享弹窗时开始绘制
        if (visible) {
          this.draw()
        }
      }
    },
    cardInfo: {
      type: Object,
      value: false
    }
  },
  data: {
    imageFile: "",
    signs: false,
    openSettingBtnHidden: false
  },
  methods: {
    // getImageInfo方法promise化，方便调用。
    getImgInfo(url) {
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: url,
          success: resolve,
          fail: reject,
        })
      })
    },
    // canvasToTempFilePath方法promise化，方便调用。
    canvasToTempFilePath(option, context) {
      return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          ...option,
          success: resolve,
          fail: reject,
        }, context)
      })
    },
    // 绘制函数
    draw() {
      wx.showLoading({
        title: '生成中'
      })
      const {
        cardInfo
      } = this.data
      const {
        logo_img,
        pic_img,
        code_img,
        pic_title,
        pic_price
      } = cardInfo
      const logoPromise = this.getImgInfo(logo_img); // 获取logo图像信息 
      const picPromise = this.getImgInfo(pic_img); // 获取商品图信息 
      const codePromise = this.getImgInfo(code_img); // 获取二维码图像信息 
      Promise.all([logoPromise, picPromise, codePromise]).then(([logo, pic, code]) => {
        // 创建绘图上下文
        const ctx = wx.createCanvasContext('myCanvas', this);
        //画布宽高
        const canvasWidth = rpx2px(750 * 3) /*三倍 */
        const canvasHeight = rpx2px(1120 * 3) /*三倍 */
        // 绘制背景
        ctx.setFillStyle('#F0F0F0')
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        // 绘制商品图
        ctx.drawImage(pic.path, 0, 0, canvasWidth, canvasWidth)

        // logo尺寸
        const logo_wh = rpx2px(114 * 3)
        const logo_padd = rpx2px(28 * 3)
        // 绘制logo
        ctx.drawImage(logo.path, logo_padd, logo_padd, logo_wh, logo_wh)

        //底部红色块位置尺寸以及坐标
        var x = 0,
          y = canvasWidth,
          r = rpx2px(26 * 3),
          w = canvasWidth,
          h = rpx2px(370 * 3);
        // 绘制footer红色背景块
        if (wx.canIUse('canvasContext.arcTo')) {
          // 开始绘制
          ctx.beginPath()
          ctx.setFillStyle('#CA0907')
          // 左上角
          ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
          // border-top
          ctx.moveTo(x + r, y)
          ctx.lineTo(x + w - r, y)
          ctx.lineTo(x + w, y + r)
          // 右上角
          ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
          // border-right
          ctx.lineTo(x + w, y + h)
          ctx.lineTo(x + w, y + h)
          // 右下角
          ctx.arc(x + w, y + h, 0, 0, 0)
          // border-bottom
          ctx.lineTo(x, y + h)
          ctx.lineTo(x, y + h)
          // 左下角
          ctx.arc(x, y + h, 0, 0, 0)
          // border-left
          ctx.lineTo(x, y + r)
          ctx.lineTo(x + r, y)
          ctx.fill()
          ctx.closePath()
          // 剪切
          ctx.clip()
        }
        //绘制商品标题
        ctx.setFontSize(rpx2px(36 * 3))
        ctx.setFillStyle('#ffffff')
        ctx.fillText(
          pic_title,
          rpx2px(40 * 3),
          canvasWidth + rpx2px(50 * 3),
          rpx2px(670 * 3)
        )
        //绘制价格块
        ctx.setFillStyle('black')
        ctx.fillRect(rpx2px(38 * 3), canvasWidth + rpx2px(148 * 3), rpx2px(300 * 3), rpx2px(76 * 3))
        // 绘制"价格："
        ctx.setFontSize(rpx2px(36 * 3))
        ctx.setFillStyle('#ffffff')
        ctx.fillText(
          "价格：",
          rpx2px(62 * 3),
          canvasWidth + rpx2px(198 * 3)
        )
        // 绘制"￥"
        ctx.setFontSize(rpx2px(52 * 3))
        ctx.fillText(
          "￥",
          rpx2px(150 * 3),
          canvasWidth + rpx2px(201 * 3)
        )
        // 绘制商品价格
        ctx.fillText(
          pic_price,
          rpx2px(195 * 3),
          canvasWidth + rpx2px(201 * 3)
        )
        // 绘制长按识别
        ctx.setFontSize(rpx2px(30 * 3))
        ctx.setFillStyle('#ffffff')
        ctx.fillText(
          "长按识别小程序码购买",
          rpx2px(38 * 3),
          canvasWidth + rpx2px(275 * 3)
        )
        //绘制二维码
        const code_wh = rpx2px(200 * 3);
        const codeX = rpx2px(510 * 3);
        const codeY = rpx2px(850 * 3);
        ctx.drawImage(code.path, codeX, codeY, code_wh, code_wh)
        //绘制"UNDER ARMOUR智慧体验"
        ctx.setFontSize(rpx2px(24 * 3))
        ctx.setFillStyle('#ffffff')
        ctx.fillText(
          "UNDER ARMOUR智慧体验",
          rpx2px(418 * 3),
          codeY + rpx2px(238 * 3)
        )
        // 完成作画
        ctx.draw(false, () => {
          this.canvasToTempFilePath({
            canvasId: 'myCanvas',
          }, this).then(({
            tempFilePath
          }) => {
            this.setData({
              imageFile: tempFilePath,
              signs: true
            })
            wx.hideLoading()
          })
        })
      })
    },
    // 拒绝后重新拉起授权
    handleSetting: function (e) {
      let that = this;
      // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
      if (!e.detail.authSetting['scope.writePhotosAlbum']) {
        wx.showModal({
          title: '警告',
          content: '若不打开授权，则无法将图片保存在相册中！',
          showCancel: false
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '您已授权，赶紧将图片保存在相册中吧！',
          showCancel: false
        })
        that.setData({
          openSettingBtnHidden: false
        })
      }
    },

    //点击保存到相册
    saveShareImg: function () {
      var that = this
      const {
        imageFile
      } = this.data
      wx.showLoading({
        title: '正在保存'
      })
      if (imageFile) {
        saveImageToPhotosAlbum({
          filePath: imageFile,
        }).then(() => {
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '已保存至相册',
            duration: 2000,
          })
        }).catch((res) => {
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '请授权',
            duration: 2000,
          })
          that.setData({
            openSettingBtnHidden: true
          })
        })
      }
    }
  }
})
