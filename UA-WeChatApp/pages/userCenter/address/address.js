var util = require('../../../utils/util.js');
var app = getApp();
var addressid;
var con;//页面上下文
Page({
  data: {
    items: [],
    startX: 0, //开始坐标
    startY: 0,
    off: true,
    btnoff:true
  },
  onLoad: function (options) {
    con = this;
    //兼容扫码编辑地址    
    if (options.q !== undefined) {
      var ewm_url = decodeURIComponent(options.q);
     // console.log(ewm_url); //打印出url
      var surls = ewm_url.split("/");//分割网址，提取出参数
      var p = surls[surls.length - 1];//最后一个是参数，设备ID|用户ID
      wx.setStorageSync('addressmsgchannel', p); 
      //wx.setStorageSync('userId', p[1]);   
      var tempOrderId = options.tempOrderId;
      addressid = options.addressid;
      this.setData({
        tempOrderId: tempOrderId,
        addressid: addressid
      })
    } else if (options.tempOrderId !== undefined){
      var tempOrderId = options.tempOrderId;
      addressid = options.addressid;
      this.setData({
        tempOrderId: tempOrderId,
        addressid: addressid
      })
    } 
  },
  onUnload: function () {
    //off == false 代表选中了地址
    if (!this.data.off) {
      return;
    }
    //获取上一页
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    //判断上一页是不是临时订单页面
    if (app.utils.notEmpty(prevPage) && prevPage.route == "pages/info/temOrder/temOrder") {
      //获取默认地址
      var orderAddress;
      //获取默认地址
      var defaultAddress;
      //选中地址
      var selectedAddress = {};

      //筛选出默认地址
      this.data.items.forEach(function (address, i) {
        if (address.isDefault == true) {//1是默认0是非默认
          defaultAddress = address;
        }
      });

      //如果临时订单页面中没有选中地址
      if (util.isStrEmpty(addressid)) {

        if (defaultAddress != undefined) {
          selectedAddress.name = defaultAddress.name;
          selectedAddress.mobile = defaultAddress.mobile;
          selectedAddress.address = defaultAddress.address;
          selectedAddress.provinceName = defaultAddress.provinceName;
          selectedAddress.cityName = defaultAddress.cityName;
          selectedAddress.districtName = defaultAddress.districtName;
          selectedAddress.id = defaultAddress.id;
          selectedAddress.isDefault = defaultAddress.isDefault;
        }
        prevPage.setData({
          add: selectedAddress
        })

      } else {
        //查看临时订单中显示的地址是否已经被删掉
        var TemporaryOrderAddressID = '';
        this.data.items.forEach(function (address, i) {
          if (address.Id == addressid) {
            TemporaryOrderAddressID = address.Id;
            orderAddress = address;
          }
        });

        //如果临时订单中显示的地址已经被删掉，那就把默认地址显示上去
        if (TemporaryOrderAddressID == '') {
          //设置默认地址
          if (defaultAddress != undefined) {
            selectedAddress.name = defaultAddress.name;
            selectedAddress.mobile = defaultAddress.mobile;
            selectedAddress.address = defaultAddress.address;
            selectedAddress.provinceName = defaultAddress.provinceName;
            selectedAddress.cityName = defaultAddress.cityName;
            selectedAddress.districtName = defaultAddress.districtName;
            selectedAddress.id = defaultAddress.id;
            selectedAddress.isDefault = defaultAddress.isDefault;
          }
        }else{
          //更新地址
          if (orderAddress != undefined) {
            selectedAddress.name = orderAddress.name;
            selectedAddress.mobile = orderAddress.mobile;
            selectedAddress.address = orderAddress.address;
            selectedAddress.provinceName = orderAddress.provinceName;
            selectedAddress.cityName = orderAddress.cityName;
            selectedAddress.districtName = orderAddress.districtName;
            selectedAddress.id = orderAddress.id;
            selectedAddress.isDefault = orderAddress.isDefault;
          }
        }
        prevPage.setData({
          add: selectedAddress
        })
      }
    }
  },
  onShow: function () {
    var that=this;
    //console.log('onShow');
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    wx.showLoading({
      title: '加载中',
    });
    // 判断是否登录 true为没有登录  进入登录页面
    if (app.utils.isEmpty(AccessTokey)) { 
      wx.showToast({
        title: '您还没有登录！',
        icon:'none',
        duration:1500
      })
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1
        })
      },2000)
    }
    else
    //  登录之后获取地址
    {
      that.getaddress();
      // 获取地址之后  影藏加载提示框
      wx.hideLoading();
    }
    
  },
  getaddress: function (){
    var that = this;
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.getAddressList ,
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
        var item = res.data;
        if (item.code == "0") {
          if (item.data.length == 0) {
            wx.showToast({
              title: "无地址，请添加地址",
              icon: "none",
              duration: 2000
            })
          }else{
            // 排序 将默认地址设为第一个
            var arr=[];
            item.data.forEach((v,m)=>{
              if (v.isDefault == "True"){
                v.isDefault=true
                arr.splice(0, 0, v);
              }else{
                v.isDefault = false
                arr.push(v)
              }
            });
            that.data.items = arr;
            that.setData(that.data);
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
    that.setData({
      off: true,
      btnoff: true
    })
  },
  /**
 * 生命周期函数--监听页面隐藏
 */
  onHide: function () {
    //console.log('onHide');
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.items.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      items: this.data.items
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.items.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      items: that.data.items
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function (e) {
    var that = this;
    var addressid = e.currentTarget.dataset.addressid;
    this.data.items.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      items: this.data.items
    })
    var userId = wx.getStorageSync("userId");
    var obj = {
      AddressId : e.currentTarget.dataset.addressid,
    };
    var AccessTokey = wx.getStorageSync("AccountTokenGet");
    var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
    wx.request({
      url: app.urls.addressDelete,
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
        console.log(res.data.code);
        //that.SendMessage();
        if (res.data.code == '0') {
          wx.showToast({
            title: "删除成功！",
            icon: "none",
            duration: 2000
          })
          // 删除之后从新获取一下地址列表
          setTimeout(()=>{
            that.getaddress();
          },2000)
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      }, 
      fail: function () {
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 1000
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

  },
  addTheAddress: function (e) {
    // var title=e.currentTarget.dataset.title;
    var titleType = 0;
    var tempOrderId = e.currentTarget.dataset.temporderid;
    var off = this.data.off;
    //      if (off) {
    wx.navigateTo({
      url: '../addressEditing/editaddress?titleType=' + titleType + '&tempOrderId=' + tempOrderId,
    })
    this.setData({
      off: false
    })
    //}
  },
  editAddress: function (e) {
    console.log(e)
    var titleType = 1;
    // var title = e.currentTarget.dataset.title;
    var name = e.currentTarget.dataset.name;
    var phone = e.currentTarget.dataset.phone;
    var street = e.currentTarget.dataset.street;
    var city = e.currentTarget.dataset.city;
    var addressid = e.currentTarget.dataset.addressid;
    var provincesid = e.currentTarget.dataset.provincesid;
    var cityid = e.currentTarget.dataset.cityid;
    var districtid = e.currentTarget.dataset.districtid;
    var provincesname = e.currentTarget.dataset.provincesname;
    var citys = e.currentTarget.dataset.citys;
    var district = e.currentTarget.dataset.district;
    var isDefault = e.currentTarget.dataset.isdefault;
    var tempOrderId = e.currentTarget.dataset.temporderid;
    var btnoff = this.data.btnoff;
    var mail = e.currentTarget.dataset.mail
    if (btnoff) {
      wx.navigateTo({
        url: '../addressEditing/editaddress?titleType=' + titleType + '&name=' + name + '&phone=' + phone + '&street=' + street + '&city=' + city + '&addressid=' + addressid + '&provincesid=' + provincesid + '&cityid=' + cityid + '&districtid=' + districtid + '&provincesname=' + provincesname + '&citys=' + citys + '&district=' + district + '&isDefault=' + isDefault + '&tempOrderId=' + tempOrderId + '&mail=' + mail,
      })
      this.setData({
        btnoff: false
      })
    }
  },
  text_add: function (e) {
    var name = e.currentTarget.dataset.name;
    var phone = e.currentTarget.dataset.phone;
    var street = e.currentTarget.dataset.street;
    var city = e.currentTarget.dataset.city;
    var addressid = e.currentTarget.dataset.addressid;
    var provincesid = e.currentTarget.dataset.provincesid;
    var cityid = e.currentTarget.dataset.cityid;
    var districtid = e.currentTarget.dataset.districtid;
    var provincesname = e.currentTarget.dataset.provincesname;
    var citys = e.currentTarget.dataset.citys;
    var district = e.currentTarget.dataset.district;
    var isdefault = e.currentTarget.dataset.isdefault;
    var tmpId = this.data.tempOrderId;
    var off = this.data.off;
    if (off) {
      if (tmpId !== undefined && tmpId !== "undefined") {
        //修改上一页data值
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];
        var selectedAddress = {};
        selectedAddress.name = name;
        selectedAddress.mobile = phone;
        selectedAddress.address = street;
        selectedAddress.provinceName = provincesname;
        selectedAddress.cityName = citys;
        selectedAddress.districtName = district;
        selectedAddress.id = addressid;
        selectedAddress.isDefault = isdefault;
        prevPage.setData({
          add: selectedAddress
        })
        //返回上一页
        wx.navigateBack({
          delta: 1,
        })
        // wx.navigateTo({
        //   url: '../../info/temOrder/temOrder?tempOrderId=' + tmpId + '&name=' + name + '&phone=' + phone + '&street=' + street + '&city=' + city + '&addressid=' + addressid + '&provincesid=' + provincesid + '&cityid=' + cityid + '&districtid=' + districtid + '&provincesname=' + provincesname + '&citys=' + citys + '&district=' + district + '&isdefault=' + isdefault + '&type=' + '1',
        // })
      }
      this.setData({
        off: false
      })
    }
  }
})