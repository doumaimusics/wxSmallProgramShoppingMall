//申请发票页面
var util = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    radioSelect:'不需要',//发票抬头0为不需要 1为个人 2为公司
    tabtaggle:'0',
    receiptTtitle:'',//公司名称或者个人
    TaxPayerId:'',//公司为纳税人识别号个人为空
    TaxMobile:'',//手机号
    TaxEmail:''//邮箱



  },
  // 页面加载
  onLoad: function (options) {
    
  },
  // 单选方法
  tabClickSelect:function(e){
    console.log(e);
    if (e.currentTarget.id=='0'){
      this.setData({ radioSelect: '不需要'});
      this.setData({ tabtaggle: 0 });
    } else if (e.currentTarget.id == '1'){
      this.setData({ radioSelect: '个人' });
      this.setData({ tabtaggle: 1 });
    }else{
      this.setData({ radioSelect: '公司' });
      this.setData({ tabtaggle: 2 });
    }
  },
  //页面初次渲染完成
  onReady: function () {

  },
  //页面显示
  onShow: function () {

  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  // 输入框
  receiptTtitle:function(e){
    this.setData({
      receiptTtitle: e.detail.value
    })
  },
  TaxPayerId: function (e) {
    this.setData({
      TaxPayerId: e.detail.value
    })
  },
  TaxMobile: function (e) {
    this.setData({
      TaxMobile: e.detail.value
    })
  },
  TaxEmail: function (e) {
    this.setData({
      TaxEmail: e.detail.value
    })
  },
  // 申请发票确定按钮
  InvoiceApplication:function(){
    var that=this;
    var promptString = ''
    var obj = {};
    if (that.data.tabtaggle == '2' && that.data.radioSelect =='公司'){
      if (util.isStrEmpty(that.data.receiptTtitle)) {
        promptString = '公司名称不能为空';
      }
      if (util.isStrEmpty(that.data.TaxPayerId)) {
        promptString = '纳税识别号不能为空';
      }
      if (util.isStrEmpty(that.data.TaxMobile)) {
        promptString = '手机号不能为空';
      }
      if (util.isStrEmpty(that.data.TaxEmail)) {
        promptString = '邮箱不能为空';
      }
      if (!util.isStrEmpty(promptString)) {
        wx.showToast({
          title: promptString,
          icon: "none",
          duration: 3000
        });
        return;
      }
      if (!app.utils.isPhone(that.data.TaxMobile)) {
        wx.showToast({
          title: "手机号格式不正确",
          icon: "none",
          duration: 3000
        });
        return;
      }
      var reg = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/gi;
      if (that.data.TaxEmail == '' || !(reg.test(that.data.TaxEmail))) {
        wx.showToast({
          title: "邮箱格式不正确",
          icon: "none",
          duration: 3000
        });
        return;
      }
      obj.radioSelect = that.data.radioSelect;
      obj.receiptTtitle =that.data.receiptTtitle;
      obj.TaxPayerId =that.data.TaxPayerId ;
      obj.TaxMobile =that.data.TaxMobile;
      obj.TaxEmail =that.data.TaxEmail;
    } else if (that.data.tabtaggle == '1' && that.data.radioSelect == '个人'){
      if (util.isStrEmpty(that.data.TaxMobile)) {
        wx.showToast({
          title: "手机号不能为空",
          icon: "none",
          duration: 3000
        });
        return;
      }
      if (!app.utils.isPhone(that.data.TaxMobile)) {
        wx.showToast({
          title: "手机号格式不正确",
          icon: "none",
          duration: 3000
        });
        return;
      }
      obj.radioSelect = that.data.radioSelect;
      obj.receiptTtitle = that.data.receiptTtitle == "" ? '个人' : that.data.receiptTtitle;
      obj.TaxPayerId = '';
      obj.TaxMobile = that.data.TaxMobile;
      obj.TaxEmail = that.data.TaxEmail;
    }else{
      obj.radioSelect = that.data.radioSelect;
      obj.receiptTtitle ='';
      obj.TaxPayerId = '';
      obj.TaxMobile = '';
      obj.TaxEmail = '';
    }
    console.log(obj);
    // 把数据带回上一个页面
    var pages = getCurrentPages();
    //var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      applynvoice: obj
    })
    // 返回前一个页面
    wx.navigateBack({
      delta: 1
    })
  },
  // 取消
  cancelApplication:function(){
    wx.navigateBack({
      delta: 1
    })
  }
});
