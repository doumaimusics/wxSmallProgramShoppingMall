// pages/userCenter/3Dclay/3Dclay.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clay:'https://wx.3dculab.com/uaxcxv1.0.1/Content/new-clay.png',
    foot:'https://wx.3dculab.com/uaxcxv1.0.1/Content/new-foot.png',
    aggle:'clay',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var windowHeight=wx.getSystemInfoSync().windowHeight
    this.setData({
      windowHeight
    })
  },
  /**
   * 获得身体参数
   */
  UserBodyInfoFun:function(){
    var that=this;
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.UserBodyInfo,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': token,
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        //console.log(res.data.date)
        if (res.data.date.length > 0) {
          var bodyData = {};
          bodyData.shoulder_breadth = res.data.date[0].shoulder_breadth + 'mm';//肩宽
          bodyData.chest_cirlen = res.data.date[0].chest_cirlen + 'mm';//胸围
          bodyData.waist_cirlen = res.data.date[0].waist_cirlen + 'mm';//腰围
          bodyData.pelvis_cirlen = res.data.date[0].pelvis_cirlen + 'mm';//臀围
          bodyData.body_height = res.data.date[0].body_height + 'mm';//身高
          bodyData.neck_croth_len = res.data.date[0].neck_croth_len + 'mm';//颈档
          bodyData.arm_left_len = res.data.date[0].arm_left_len + 'mm';//臂长
          bodyData.leg_len = res.data.date[0].leg_len + 'mm';//腿长
          bodyData.wrist_left_cirlen = res.data.date[0].wrist_left_cirlen + 'mm';//腕围左
          bodyData.wrist_right_cirlen = res.data.date[0].wrist_right_cirlen + 'mm';//腕围右
          bodyData.neck_cirlen = res.data.date[0].neck_cirlen + 'mm';//胫围
          bodyData.thigh_left_cirlen = res.data.date[0].thigh_left_cirlen + 'mm';//腿围
          that.setData({
            bodyData: bodyData
          })
        } else {
          wx.showToast({
            title: '暂无数据',
            icon: "none",
            duration: 1500
          })
        }
      },
      fail:function(src){
        console.log(src)
        // if (data.statusCode){

        // }
      },
      complete: function (com) {
        //token过期
        console.log(com)
        if (com.statusCode == 401) {
          // 重新获取token
          app.funGetToken();
        } else if (com.statusCode==500){
          wx.showToast({
            title: '请求错误！',
            icon:'none',
            duration:1500
          })
        }
      }
    })   
  },
  /**
   * 获取足型参数
   */
  getUserFootFun:function(){
    var that = this;
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.UserFoot,
      method: 'get',
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': token,
        'Channel': 'UA',
        'CallSource': 'XCX',
        'DeviceCode': '',
      },
      success: function (res) {
        console.log(res.data)
        var footData = {};
        if (res.data.date.length > 0) {
          // 脚型
          if ( Number(res.data.date[0].FootTypeName )== 2){
            footData.FootTypeName ='罗马脚'
          } else if ( Number(res.data.date[0].FootTypeName) == 1){
            footData.FootTypeName = '希腊脚'
          }else{
            footData.FootTypeName = '埃及脚'
          }
          //脚宽类型
          if (Number(res.data.date[0].foot_breadth) < -20){
            footData.foot_breadth ='偏窄'
          } else if (Number(res.data.date[0].foot_breadth) > 20){
            footData.foot_breadth ='偏宽'
          } else {
            footData.foot_breadth ='正常'
          }
          //脚背高度
          if (Number(res.data.date[0].instep_high) < -20){
            footData.instep_high ='偏低'
          } else if (Number(res.data.date[0].instep_high) > 20) {
            footData.instep_high = '偏高'
          }else{
            footData.instep_high = '正常'
          }
          footData.leftLength = res.data.date[0].leftLength + 'mm';//左脚长
          footData.rightLength = res.data.date[0].rightLength + 'mm';//右脚长
          footData.leftBreadth = res.data.date[0].leftBreadth + 'mm';//左脚宽
          footData.rightBreadth = res.data.date[0].rightBreadth + 'mm';//右脚宽
          footData.leftFootCirlen = res.data.date[0].leftFootCirlen + 'mm';//左脚围
          footData.rightFootCirlen = res.data.date[0].rightFootCirlen + 'mm';//右脚围
          footData.leftInstepCirlen = res.data.date[0].leftInstepCirlen + 'mm';//左脚背围
          footData.rightInstepCirlen = res.data.date[0].rightInstepCirlen + 'mm';//右脚背围
        } else {
          footData.FootTypeName='暂无数据'
          wx.showToast({
            title: '暂无数据',
            icon: "none",
            duration: 1500
          })
        }
        that.setData({
          footData: footData
        })
      },
      complete: function (com) {
        //token过期
        if (com.statusCode == 401) {
          // 重新获取token
          app.funGetToken();
        } else if (com.statusCode == 500) {
          wx.showToast({
            title: '请求错误！',
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
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获得身体参数
    var that = this;
    that.UserBodyInfoFun();
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
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 身体参数和足型参数之间切换
   */
  aggleBtn:function(e){
    var that=this
    if (e.currentTarget.id=='3d'){
      that.UserBodyInfoFun();
      that.setData({
        aggle:'clay'
      })
    }else{
      // 获取足型参数
      that.getUserFootFun();
      that.setData({
        aggle: 'foot'
      })
    }
  },
})