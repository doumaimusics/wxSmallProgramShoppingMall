//index.js
var city_new = require('../../../utils/city.js');
var cityData_new = city_new.data.RECORDS;

var app = getApp();

var provinceName = '' // 选择省区 -名字
var province_id = ''; // 选择省区 -id

var cityName = '' // 选择市区 - 名字
var city_id = ''; // 选择省区 -id

var countyName = '' // 选择县区 -名字
var county_id = ''; // 选择省区 -id

// 所有的 省市区 集合  
var result_province = cityData_new.filter(
  function (value) {
    return (value.level_type == 1);
  }
);
var result_city = cityData_new.filter(
  function (value) {
    return (value.level_type == 2);
  }
);
var result_county = cityData_new.filter(
  function (value) {
    return (value.level_type == 3);
  }
);

// 当前的 省市区 集合
var province_s = result_province
var city_s = []; // “市区”集合
var county_s = [];// “县区”集合

Page({
  data: {
    // 城市数据
    pc: false,
    off: true,
    img1: '../../../resources/imgs/circle1.png',
    img2: '../../../resources/imgs/circle2.png',
    clearUsername: "none",
    clearPhone: "none",
    clearCode: "none",
    provinces: province_s,
    citys: city_s,
    countys: county_s,
    cityValue: [0, 0, 0],
    cityText: '省、市、区',
    cityCode: '',
    isCity: true // 是否选择弹出 选择城市
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  sureAction: function (){
    var that = this;
    console.log("provinces:"+that.data.provinces.length);
    console.log("citys:" + that.data.citys.length);
    console.log("countys:" + that.data.countys.length);
    that.setData({
      isCity: false
    })

  },
  onLoad: function (params) {
    //城市
    // 获取第一列元素 -- 北京
    var tempOrderId = params.tempOrderId
    var title=params.title;
    var username = params.name;
    var phone = params.phone;
    var cityText = params.city;
    var address = params.street;
    var addressid = params.addressid;
    var provincesid = params.provincesid;
    var cityid = params.cityid;
    var districtid = params.districtid;
    var provincesname = params.provincesname;
    var citys = params.citys;
    var district = params.district;
    var isDefault =  params.isDefault;

    city_s = this.selectResultAction(result_city, 110000);
    county_s = this.selectResultAction(result_county, 110100);
    this.setData({
      provinces: province_s,
      citys: city_s,
      countys: county_s,
      username:username,
      phone: phone,
      cityText: cityText,
      address:address,
      addressid: addressid,
      province_id: provincesid,
      city_id: cityid,
      county_id:districtid,
      provinceName:provincesname,
      cityName:citys,
      countyName:district,
      mername: title,//options为页面路由过程中传递的参数
      // isAddAdress: data.isAddAdress
      tempOrderId:tempOrderId,
      pc: Boolean(Number(isDefault))
    });
    wx.setNavigationBarTitle({
      title: this.data.mername//页面标题为路由参数
    })
    // this.setData({
    //   cityValue: data.cityValue
    // });
  },
  choisePc: function () {
    this.data.pc = !this.data.pc;
    this.data.canLogin = app.utils.notEmpty(this.data.phone) && app.utils.notEmpty(this.data.cityText) && app.utils.notEmpty(this.data.username) && app.utils.notEmpty(this.data.address);
    this.setData(this.data);
  },
  onInput: function (event) {
    var id = event.currentTarget.id
    this.data[id] = event.detail.value;
    if (id == 'username') {
      this.data.clearUsername = 'block';
    } else if (id == 'phone') {
      this.data.clearPhone = 'block';
    } else if (id == 'code') {
      this.data.clearCode = 'block';
    }
    if (this.data[id].length >= 140) {
      wx.showToast({
        title: "字数限制在140以内",
        icon: "none",
        duration: 1000
      })
    }
    this.data.canLogin = app.utils.notEmpty(this.data.phone) && app.utils.notEmpty(this.data.cityText) && app.utils.notEmpty(this.data.username) && app.utils.notEmpty(this.data.address);

    this.setData(this.data);

  },
  onblur: function (event) {
    var id = event.currentTarget.id
    this.data[id] = event.detail.value;
    
    if (id == 'username') {
      if (this.data[id] == "" || this.data[id] == null || this.data[id] == undefined){
        wx.showToast({
          title: "用户名不能为空",
          icon: "none",
          duration: 1000
        })
      }
    } else if (id == 'phone') {
      if (this.data[id] == "" || this.data[id] == null || this.data[id] == undefined) {
        wx.showToast({
          title: "手机号不能为空",
          icon: "none",
          duration: 1000
        })
      }
    } else if (id == 'address') {
      if (this.data[id] == "" || this.data[id] == null || this.data[id] == undefined) {
        wx.showToast({
          title: "详细地址不能为空",
          icon: "none",
          duration: 1000
        })
      }
    }
    this.setData(this.data);

  },
  onfocus:function(e){
   
  },
  SendMessage:function()
  {
    try
    {
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
        var objJsonEn = aesEncrypt(objJson, aesKey, iv);
        
        wx.request({
          url: app.urls.AddressSendMessage,
          method: 'GET',
          data: { param: objJsonEn },
          header: {
            'content-type': 'application/json', // 默认值
            'Channel': 'UA',
            'CallSource': 'XCX',
            'DeviceCode': '',
          },
          success: function (res) {
            console.log(res.data)            
          }
        })

      }
    }
    catch(err)
    {

    }
  },
  selectResultAction: function (data, event) {

    var result = data.filter(
      function (value) {
        return (value.parent_id == event);
      }
    );
    return result;
  },
  //城市选择器
  cityChange: function (e) {
    var val = e.detail.value // 改变的picker 每一列对应的下标位置
    var t = this.data.cityValue; // 原本的位置 
    if (val[0] != t[0]) { // 第一列改变
      city_s = [];
      county_s = [];
      var current_id = province_s[val[0]].id;
      city_s = this.selectResultAction(result_city, current_id);
      var current_city_id = city_s[0].id;
      county_s = this.selectResultAction(result_county, current_city_id);
      this.setData({
        citys: city_s,
        countys: county_s,
        cityValue: [val[0], 0, 0]
      })
      return;
    }
    if (val[1] != t[1]) {// 第二列改变
      county_s = [];
      var current_city_id = city_s[val[1]].id;
      county_s = this.selectResultAction(result_county, current_city_id);
      this.setData({
        countys: county_s,
        cityValue: [val[0], val[1], 0]
      })
      return;
    }
    if (val[2] != t[2]) {// 第三列改变
      this.setData({
        county: this.data.countys[val[2]],
        cityValue: val
      })
      return;
    }
  },
  //确定选择
  ideChoice: function (e) {
    var that = this;
    var $act = e.currentTarget.dataset.act;
    var $mold = e.currentTarget.dataset.mold;

    //城市
    if ($act == 'confirm' && $mold == 'city') {

      var t = this.data.cityValue; // 原本的位置 

      // 记录当前选择的省市区ID  
      province_id = province_s[t[0]].id;
      city_id = city_s[t[1]].id;
      county_id = county_s[t[2]].id;
    
    // 记录当前选择的省市区名称
      provinceName = province_s[t[0]].name;
      cityName = city_s[t[1]].name;
      countyName = county_s[t[2]].name;
      that.provinceName = provinceName;
      that.cityName = cityName;
      that.countyName = countyName;
      that.province_id = province_id;
      that.city_id = city_id;
      that.county_id = county_id;
      that.cityText = provinceName + ' - ' + cityName + ' - ' + countyName
      that.cityCode = province_id + ' - ' + city_id + ' - ' + county_id
      that.setData({
        cityText: that.cityText,
        cityCode: that.cityCode,
        provinceName:that.provinceName,
        cityName:that.cityName,
        countyName:that.countyName,
        province_id:that.province_id,
        city_id:that.city_id,
        county_id:that.county_id
      })
    }
    that.data.canLogin = app.utils.notEmpty(this.data.phone) && app.utils.notEmpty(this.data.cityText) && app.utils.notEmpty(this.data.username) && app.utils.notEmpty(this.data.address);
    that.setData({
      isCity: true
    })  
  },
  btn:function(e){
    // 正确的验证登录
    var that = this;
    if (this.data.canLogin) {
      var username = this.data.username;
      var phone = this.data.phone;
      var cityText = this.data.cityText;
      var address = this.data.address;
      var provinceName = this.data.provinceName;
      var cityName = this.data.cityName;
      var countyName = this.data.countyName;
      var province_id = this.data.province_id;
      var city_id = this.data.city_id;
      var county_id = this.data.county_id;
      var isdefault = String(Number(this.data.pc));
      var weixinUserInfo = wx.getStorageSync('weixinUserInfo');
      var addressid = this.data.addressid;
      var nickName = weixinUserInfo.nickName;
      var avatarUrl = weixinUserInfo.avatarUrl;
      var gender = weixinUserInfo.gender; //性别 0：未知、1：男、2：女
      var province = weixinUserInfo.province;
      var city = weixinUserInfo.city;
      var userId = wx.getStorageSync("userId");
      var off = this.data.off;
      var tempOrderId = e.currentTarget.dataset.temporderid; 
      if (username.match(/^[\u4e00-\u9fa5]+$/)) {
        console.log(username);
      } else {
        wx.showModal({
          title: "提示",
          content: "用户名有误!",
          confirmText: "确定",
          success: function (res) {
            if (res.confirm == 1) {
              action();
            }
          }
        });
        return;
      }
      if (phone.match(/^1[34578][0-9]{9,9}$/)) {
        console.log(username);
      } else {
        wx.showModal({
          title: "提示",
          content: "手机号有误!",
          confirmText: "确定",
          success: function (res) {
            if (res.confirm == 1) {
              action();
            }
          }
        });
        return;
      }
      wx.setStorageSync("weixinUserPhone", phone);
      if (addressid==undefined){
          var obj = {
            name: username,
            code: '',
            mobile: phone,
            province_code: province_id,
            province_name: provinceName,
            city_code: city_id,
            city_name: cityName,
            district_code: county_id,
            district_name: countyName,
            street: '',
            zip: '',
            detail: address,
            isdefault: isdefault,
            supplier: '',
            user_id: userId //'5a6066eacd375a11600050fb'
          }
          var objJson = JSON.stringify(obj);
          var objJsonEn = app.utils.AES_Encrypt(objJson);
          // objJsonEn = encodeURIComponent(objJsonEn);
          objJsonEn = JSON.stringify({ param: objJsonEn })
        if (off) {
          var AccessTokey = wx.getStorageSync("AccountTokenGet");
          var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
          wx.request({
            url: app.urls.addressCreate,
            method:'POST',
            data: objJsonEn,
            header: {
              'content-type': 'application/json', // 默认值
              'Authorization': token,
              'Channel': 'UA',
              'CallSource': 'XCX',
              'DeviceCode': '',
            },
            success: function (res) {
              console.log(res.data)
              that.SendMessage();
              wx.redirectTo({
                url: '../address/address?tempOrderId=' + tempOrderId,
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
          this.setData({
            off: false
          })
        }
      }else{
        var obj1 = {
          name: username,
          code: '',
          mobile: phone,
          province_code: province_id,
          province_name: provinceName,
          city_code: city_id,
          city_name: cityName,
          district_code: county_id,
          district_name: countyName,
          street: '',
          zip: '',
          detail: address,
          isdefault: isdefault,
          supplier: '',
          user_id: userId, //'5a6066eacd375a11600050fb',
          address_id: addressid
        }
        var objJson1 = JSON.stringify(obj1);
        var objJsonEn1 = app.utils.AES_Encrypt(objJson1);
        // objJsonEn = encodeURIComponent(objJsonEn);
        objJsonEn1 = JSON.stringify({ param: objJsonEn1 })
        var AccessTokey = wx.getStorageSync("AccountTokenGet");
        var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
        wx.request({
          url: app.urls.addressUpdate,
          method: 'POST',
          data: objJsonEn1,
          header: {
            'content-type': 'application/json', // 默认值
            'Authorization': token,
            'Channel': 'UA',
            'CallSource': 'XCX',
            'DeviceCode': '',
          },
          success: function (res) {
            console.log(res.data)
            that.SendMessage();
            wx.redirectTo({
              url: '../address/address',
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
    }else{
      wx.showToast({
        title: "请编辑地址",
        icon: "none",
        duration: 3000
      })
    }
  }

})
