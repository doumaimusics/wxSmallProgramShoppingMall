var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    arrayReason: ['卖家没有库存', '买错了/买多了', '后悔了，不想要了', '未按时间约定发货'],
    arrayPhoto: ['从相机选择', '去拍照'],
    photourl: "../../../resources/imgs/defaultphoto.gif",
    photoids:[],
    reasonIndex: -1,
    amount: 0,
    orderId: "",
    userReason: "",
    returnType: "106",
    userMemo: ""
  },
  onLoad: function (options) {
    var orderid = options.orderid;
    this.setData({
      orderId: orderid
    })

    var amount = options.amount;
    this.setData({
      amount: amount
    })
  },
  onShow: function () {

  },
  bindPickerChange: function (e) {
    this.data.reasonIndex = parseInt(e.detail.value);
    this.data.userReason = this.data.arrayReason[this.data.reasonIndex];
    this.setData(this.data);
  },
  photoPickerChange: function (e) {
    var that = this;
    var sourceType = parseInt(e.detail.value) == "0" ? "album" :"camera";//0相册，1拍照

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: [sourceType], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        //var timestamp = Date.parse(new Date());
        //console.log("timestamp:" + timestamp);
        if (res.tempFilePaths.length > 0) {
          console.log("url:" + app.urls.OrderReturnUpload);
          console.log("filePath:" + res.tempFilePaths[0]);
          console.log("name:" + "file");
          wx.uploadFile({
            url: app.urls.OrderReturnUpload, //  
            filePath: res.tempFilePaths[0],
            name: "file",           
            success: function (res1) {
              
              try { 
                //console.log(res1);  
                //console.log(res1.data);  
                //console.log("res1.statusCode="+res1.statusCode);                 
                var retData = JSON.parse(res1.data);
                //console.log("retData.code=" + retData.code);
                //console.log("retData.data=" + retData.data); 
                if (res1.statusCode == 200 && retData.code=="0")
                {  
                  that.data.photoids = retData.data;
                  that.setData(that.data);   
                  //console.log("that.data.photoids="+that.data.photoids);
                }  
              }
              catch (e) {
                console.log(e);
              }  
            },
            fail: function (res1) {
              //var data = res.data
              console.log("uploadfile-error:" + JSON.stringify(res1));              
            },
          })
          
          that.data.photourl = res.tempFilePaths[0];
          that.setData(that.data);
          
        }
      }
    })
  },
  onuserMemoblur:function(e){
    var that = this;
    that.data.userMemo = e.detail.value;
    that.setData(that.data);
  },

  deleteIMGbtn: function (e) {
    var that = this;
    that.data.photourl = "../../../resources/imgs/defaultphoto.gif";
    that.data.photoids = [];
    that.setData(that.data);
  },
  
  submit: function () {
    var that = this;
    var orderId = that.data.orderId;
    var userReason = that.data.userReason;
    var returnType = that.data.returnType;
    var userMemo = that.data.userMemo;
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

    if (app.utils.isEmpty(userReason)) {
      wx.showToast({
        title: '请选择原因',
        icon:'none',
        duration:2000
      })
      return false;
    }
    // if (app.utils.isEmpty(userMemo)) {
    //   wx.showToast({
    //     title: '请输入补充说明'
    //   })
    //   return false;
    // }
    var obj = {
      OrderId: orderId,
      Reason: userReason,
      RequestType: returnType,
      Remark: userMemo,
      Photo: that.data.photoids
    }
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.Returns,
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
            title:"申请成功!",
            duration:3000,
            success:function()
            {
              setTimeout(function(){
                wx.navigateBack({
                  delta: 1
                })
              },3000);
            }
          })
        }
        else
        {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  }
})