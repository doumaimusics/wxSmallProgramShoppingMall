// pages/address/address.js
var util = require('../../../utils/util.js');
var dataList = require('../../../utils/address_data.js');
var addressJsonList = dataList.addressJsonList;
var app = getApp();
var titleType;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ishiddenPickerView: true,
    valueindext: [0, 0, 0],
    img1: '../../../resources/imgs/circle1.png',
    img2: '../../../resources/imgs/circle2.png',
    isdefault: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    //禁止转发
    wx.hideShareMenu();
    console.log(addressJsonList.length);

    wx.showLoading({
      title: '加载中',
      mask: true,
    });

    wx.setNavigationBarTitle({
      title: params.titleType == 0 ? '添加地址' : '修改地址'//页面标题为路由参数
    });
    titleType = params.titleType;
    var p_index = 0, c_index = 0, a_index = 0;
    for (var i = 0; i < addressJsonList.length; i++) {
      if (addressJsonList[i].PRV_NUM_ID == params.provincesid) {
        p_index = i;
        for (var c = 0; c < addressJsonList[i].citys.length; c++) {

          if (addressJsonList[i].citys[c].CITY_NUM_ID == params.cityid) {
            c_index = c;
            for (var a = 0; a < addressJsonList[i].citys[c].area.length; a++) {
              if (addressJsonList[i].citys[c].area[a].CITY_AREA_NUM_ID == params.districtid) {
                a_index = a;
                break;
              }
            }
            break;
          }

        }
        break;
      }
    }
    console.log(params.isDefault);
    this.setData({
      addressEntity: {
        addressid: params.addressid,
        name: params.name,
        mobile: params.phone,
        province_code: params.provincesid,
        province_name: params.provincesname,
        city_code: params.cityid,
        city_name: params.citys,
        district_code: params.districtid,
        district_name: params.district,
        detail: params.street,
        isdefault: util.isStrEmpty(params.isDefault) ? false : params.isDefault,
        mail: params.mail
      },//获取数据成功后的数据绑定  
      prv: addressJsonList,
      city: addressJsonList[p_index].citys,
      area: addressJsonList[p_index].citys[c_index].area,
      prvName: params.provincesname,
      cityName: params.citys,
      areaName: params.district,
      isdefault: util.isStrEmpty(params.isDefault) ? false : params.isDefault,
      valueindext: [p_index, c_index, a_index]
    });
    // wx.setNavigationBarTitle({
    //   title: this.data.mername//页面标题为路由参数
    // })
    wx.hideLoading();
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
  /**
   * 选择框改变事件
   */
  checkboxChange: function (e) {

    this.setData({
      isdefault: this.data.isdefault == false || this.data.isdefault == 'false' ? true : false
    });
    console.log("选择默认", this.data.isdefault);
  },
  SendMessage: function () {
    try {
      //判断是否有TV消息请求并发消息
      var storeageMessage = "";
      storeageMessage = wx.getStorageSync("addressmsgchannel");
      if (!app.utils.isEmpty(storeageMessage)) {
        var p = storeageMessage.split('|'); //设备id+用户id

        var obj = {
          deviceid: p[0],
          userid: p[1]
        };
        var objJson = JSON.stringify(obj);
        var objJsonEn = app.utils.AES_Encrypt(objJson);

        wx.request({
          url: app.urls.AddressSendMessage,
          method: 'get',
          data: { param: objJsonEn },
          header: {
            'content-type': 'application/json', // 默认值
            'Channel': 'UA',
            'CallSource': 'XCX',
            'DeviceCode': '',
          },
          success: function (res) {
            console.log(res.data)
          },
          fail: function () {
            console.log("传递地址消息失败");
          }, complete: function () {
            console.log("传递地址消息成功");
          }
        })

      }
    }
    catch (err) {
      console.log("传递地址消息失败"+err);    
    }
  },
  /**
   * 提交按钮事件
   */
  addressFormSubmit: function (e) {
    var that = this;
    var promptString = ''
    if (util.isStrEmpty(e.detail.value.name)) {
      promptString = '姓名不能为空';
    }
    if (util.isStrEmpty(e.detail.value.mobile)) {
      promptString = '手机号码不能为空';
    }
    if (util.isStrEmpty(e.detail.value.region)) {
      promptString = '省，市，区不能为空';
    }
    if (util.isStrEmpty(e.detail.value.detail)) {
      promptString = '详细地址不能为空';
    }
    if (!util.isStrEmpty(promptString)) {
      wx.showToast({
        title: promptString,
        icon: "none",
        duration: 3000
      });
      return;
    }
    if (!app.utils.isPhone(e.detail.value.mobile)) {
      wx.showToast({
        title: "手机号格式不正确",
        icon: "none",
        duration: 3000
      });
      return;
    }
    var reg = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/gi;
    if (e.detail.value.mail == '' || !(reg.test(e.detail.value.mail))){
      wx.showToast({
        title: "邮箱格式不正确",
        icon: "none",
        duration: 3000
      });
      return;
    }
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    var obj = {
      AddressId: this.data.addressEntity.addressid,
      Name: e.detail.value.name,
      Email: e.detail.value.mail,
      Mobile: e.detail.value.mobile,
      ProvinceId: addressJsonList[this.data.valueindext[0]].PRV_NUM_ID,
      ProvinceName: addressJsonList[this.data.valueindext[0]].PRV_NAME,
      CityId: addressJsonList[this.data.valueindext[0]].citys[this.data.valueindext[1]].CITY_NUM_ID,
      CityName: addressJsonList[this.data.valueindext[0]].citys[this.data.valueindext[1]].CITY_NAME,
      DistrictId: addressJsonList[this.data.valueindext[0]].citys[this.data.valueindext[1]].area[this.data.valueindext[2]].CITY_AREA_NUM_ID,
      DistrictName: addressJsonList[this.data.valueindext[0]].citys[this.data.valueindext[1]].area[this.data.valueindext[2]].CITY_AREA_NAME,
      ZipCode: '',
      Details: e.detail.value.detail,
      IsDefault: this.data.isdefault == false || this.data.isdefault == 'false' ? false:true,
    }
    console.log(JSON.stringify( obj));
    if (titleType == 0) {
      var AccessTokey = wx.getStorageSync("AccountTokenGet");
      var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
      wx.request({
        url: app.urls.addressCreate,
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
          wx.hideLoading();
          that.SendMessage();
          if (res.data.code == '0') {
            //返回上一页
            wx.navigateBack({
              delta: 1
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
            title: '添加失败',
            icon: 'none',
            duration: 3000
          })
        },
        complete: function(com){
          //token过期
          if (com.statusCode == 401) {
            // 重新获取token
            app.funGetToken();
          }
        }
      });
    } else {
      var AccessTokey = wx.getStorageSync("AccountTokenGet");
      var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
      wx.request({
        url: app.urls.addressUpdate,
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
          if (res.data.code == '0') {
            that.SendMessage();
            //返回上一页
            wx.navigateBack({
              delta: 1
            })
          } else {
            if (res.data.message==''){
              wx.navigateBack({
                delta: 1
              })
            }else{
              wx.showToast({
                title: res.data.message,
                icon: 'none',
                duration: 2000
              })
            }
            
          }
        },
        fail:function(){
          wx.showToast({
            title: '修改失败',
            icon: 'none',
            duration: 2000
          })
        }, 
        complete: function (com) {
          //token过期
          if (com.statusCode == 401) {
            // 重新获取token
            app.funGetToken();
          }
          wx.hideLoading();
        }
      });
    }
  },

  /**
   * 滚动条选中事件
   */
  pickerChange: function (e) {
    const pickerPosition = e.detail.value;
    console.log("valueindext  :  " + this.data.valueindext[0] + "   " + this.data.valueindext[1] + "   " + this.data.valueindext[2]);
    console.log("pickerPosition  :  " + pickerPosition[0] + "   " + pickerPosition[1] + "   " + pickerPosition[2]);
    if (this.data.valueindext[0] != pickerPosition[0]) {
      pickerPosition[1] = 0;
      pickerPosition[2] = 0;
      console.log("滚动了省份");
    }
    if (this.data.valueindext[1] != pickerPosition[1]) {
      pickerPosition[2] = 0;
      console.log("滚动了市");
    }
    this.setData({
      // valueindext: [0, 3]
      // city: prv[pickerPosition[0]].citys,
      // area: prv[pickerPosition[0]].citys[pickerPosition[1]].area,
      city: addressJsonList[pickerPosition[0]].citys,
      area: addressJsonList[pickerPosition[0]].citys[pickerPosition[1]].area,
      valueindext: [pickerPosition[0], pickerPosition[1], pickerPosition[2]]
    });
  },

  /**
   * 取消滚动条
   */
  cancelPicker: function () {
    //隐藏选择器
    if (!this.data.ishiddenPickerView) {
      this.setData({
        ishiddenPickerView: true
      });
    }
  },

  /**
 * 确定选中条滚动
 */
  OKPicker: function () {
    var prv = addressJsonList[this.data.valueindext[0]].PRV_NAME;
    var city = addressJsonList[this.data.valueindext[0]].citys[this.data.valueindext[1]].CITY_NAME;
    var atea = addressJsonList[this.data.valueindext[0]].citys[this.data.valueindext[1]].area[this.data.valueindext[2]].CITY_AREA_NAME;
    console.log("省 ：" + prv + "    市：" + city + "    区：" + atea);
    //隐藏选择器
    if (!this.data.ishiddenPickerView) {
      this.setData({
        ishiddenPickerView: true,
        prvName: prv,
        cityName: city,
        areaName: atea
      });
    }




  },

  /**
   * 显示地址选择器
   */
  showPickerView: function () {
    console.log("valueindext  :  " + this.data.valueindext[0] + "   " + this.data.valueindext[1] + "   " + this.data.valueindext[2]);
    if (this.data.ishiddenPickerView) {
      this.setData({
        ishiddenPickerView: false
      });
    }

  }
})