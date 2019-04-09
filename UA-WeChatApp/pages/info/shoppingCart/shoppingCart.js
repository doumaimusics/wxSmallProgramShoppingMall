var app = getApp();
var shoppingCartList;
var SelectedCount = 0;//被选中的数量
var shoseCount = 0;//全部数量；
Page({
  data: {
    startX: 0, //开始坐标
    startY: 0,
    img1: '../../../resources/imgs/circle1.png',
    img2: '../../../resources/imgs/circle2.png',
    totalPrice: 0.00,
    isSelectedAll: false,
    off: true,
    btn1: true,
    taggleBtnText: '编辑',
    isEdit: false,
    buyCount: "1",
    isEditSuccess: true,
  },
  onLoad: function () {
  },
  /**
   * 获取购物车列表
   */
  pageLoading:function(){
    //每次打开页面都会调用一次
    var context = this;
      var AccessTokey = wx.getStorageSync("AccountTokenGet");
      if (AccessTokey == null || AccessTokey == "") {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 1000
        })
        return
      }
      var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
      wx.request({
        url: app.urls.getList,
        method: 'get',
        header: {
          'content-type': 'application/json', // 默认值
          'Authorization': token,
          'Channel': 'UA',
          'CallSource': 'XCX',
          'DeviceCode': '',
        },
        success: function (res) {
          console.log(res)
          wx.hideLoading();
          if (res.data.code == '0') {
            var itemList = res.data.data;
            var shoesitemArr = [];
            if (itemList !=null && itemList.length > 0) {
              itemList.forEach((v,index)=>{
                var goodsT = v;
                var pc = false;
                var CartItemValidate;
                if (v.available=='true') {
                  pc = false;
                  CartItemValidate = 0;
                }else{
                  pc = null;
                  CartItemValidate = 1;
                }
                goodsT.pc = pc;
                goodsT.isclick = true;
                goodsT.CartItemValidate = CartItemValidate;
                context.setData({
                  productId: goodsT.productId
                })
              })
              context.setData({
                isSelectedAll: false,
                totalPrice: 0,
              })
            } else {
              wx.showToast({
                title: "无商品",
                icon: "none",
                duration: 3000
              })
              context.data.isSelectedAll = false;
              context.setData({
                isSelectedAll: true,
                totalPrice: 0
              })
            }
            context.data.itemList = itemList;
            context.setData(context.data);
            //console.log(JSON.stringify( itemList))
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 1000
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
      context.setData({
        btn1: true
      })
  },
  onShow: function () {
    this.pageLoading();
    this.setData({
      off: true,
    })
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  /**
   * 选择某一个
   */
  selectedlist: function (e) {
    var groupindex = e.currentTarget.dataset.groupindex;
    var childindex = e.currentTarget.dataset.childindex;
    var shoppingCartList = this.data.itemList;
    shoppingCartList[groupindex].pc = !shoppingCartList[groupindex].pc;
    //shoppingCartList.forEach((v,i)=>{
      if (shoppingCartList[groupindex].pc == true) {
        this.data.off = true;
      } else {
        var num=0;
        shoppingCartList.forEach((v, i) => {
          if(v.pv==true){
            num++;
            if (num>0){
              this.data.off = true;
            }else{
              this.data.off = false;
            }
          }
        }) 
      }
    //})
    shoppingCartList[groupindex] = shoppingCartList[groupindex];
    this.setData({
      itemList: shoppingCartList,
    });
    this.setData(this.data)
    this.getTotalPrice();
  },
  /**
   * 全选方法
   */
  checkAll: function (e) {
    var isCheckAll = this.data.isSelectedAll;
    var datalist = this.data.itemList;
    var pcnull=[];
    datalist.forEach((v,i)=>{
      //点击全选库存不足的不选中
      if (v.CartItemValidate == 1) {
        v.pc = v.pc;
      } else {
        pcnull.push(v)
        v.pc = !isCheckAll;
      }
      //shoseEntity.pc = !isCheckAll;
      if (v.pc == true) {
        this.data.off = true;
      } else {
        if (pcnull.length>0){
          this.data.off = true;
        }else{
          this.data.off = false;
        }
      }
    })
    this.setData({
      itemList: datalist,
      isSelectedAll: !isCheckAll
    });
    this.setData(this.data)
    this.getTotalPrice();
  },
  getTotalPrice: function () {
    //重新计算选中数量
    SelectedCount = 0;
    //重新计算总数
    shoseCount = 0;
    var datalist = this.data.itemList;
    let total = 0.00;
    datalist.forEach((v,i)=>{
      if (v.CartItemValidate == 0) {
        shoseCount = shoseCount + 1;
      }
      if (v.pc) {
        SelectedCount = SelectedCount + 1;
        //console.log(shoseEntity.sellPrice * shoseEntity.count);
        total = total + (v.salePrice * v.count);
      }
    })
    console.log(SelectedCount != shoseCount);
    this.setData({
      totalPrice: total,
      isSelectedAll: SelectedCount == shoseCount
    });
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    // 购物车点击了编辑则不能像左滑动
    if (this.data.isEdit) {
      return;
    }
    //开始触摸时 重置所有删除
    var list = this.data.itemList;
    list.forEach(function (m, i) {
      if (m.isTouchMove)//只操作为true的
        m.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      itemList: this.data.itemList
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    // 购物车点击了编辑则不能像右滑动
    if (this.data.isEdit) {
      return;
    }
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      id = e.currentTarget.dataset.id,
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    var list = this.data.itemList;
    list.forEach(function (m, i) {
      if (i == id) {
          m.isTouchMove = false
          //滑动超过30度角 return
          if (Math.abs(angle) > 30) return;
          if (i == index) {
            if (touchMoveX > startX) //右滑
              m.isTouchMove = false
            else //左滑
              m.isTouchMove = true
          }
      }
    })
    //更新数据
    that.setData({
      itemList: this.data.itemList
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
    var skuid = e.currentTarget.dataset.skuid;//'5a14f56ee6c58c07f882cd5b'//
    var list = that.data.itemList;
    var shoeId = e.currentTarget.dataset.storeid;//'5b9730a8e6c58c12488fbe20'//
    var id = e.currentTarget.dataset.id;
    var isclick = e.currentTarget.dataset.isclick;
    console.log(isclick);
    var obj = [{
      StoreID: shoeId,
      SkuID: skuid
    }];
    
    list.forEach(function (m, i) {
      //m.shoesitem.forEach((v, n) => {
      if (skuid == m.skuId) {
        list.splice(e.currentTarget.dataset.index, 1);
          // 调用购物车删除方法 方法在app.js中
          if(m.isclick){
            app.remShoppingCartFun(obj, '购物车');
            // 获取购物车数量 从app.js中获得
            app.shopNumber(that);
            m.isclick = false;
          }
        }
      //})
    })
    that.getTotalPrice();
    if (that.data.itemList.length == 0) {
      isSelectedAll = false;
      that.setData({
        isSelectedAll: false
      })
    }
    that.setData({
      itemList: that.data.itemList
    })
  },
  /**
   * 购物车结算方法
   */
  order: function (e) {
    var that = this;
    var listSku = this.data.itemList;
    var arr = [];
    var btn = e.currentTarget.dataset.btn;
    var btn1 = this.data.btn1;
    if (btn) {
      listSku.forEach(function (m, n) {
        if (m.pc) {
          var obj1 = {};
          obj1.Count = m.count;
          obj1.SkuId = m.skuId;
          obj1.StoreId = m.storeId;
          arr.push(obj1);
        }
      })
      if (arr.length !== 0) {
        var obj = {
          OrderType:'ONLINE',
          products: arr
        }
        if (btn1) {
          var that = this;
          that.setData({
            btn1: false
          })
          var AccessTokey = wx.getStorageSync("AccountTokenGet");
          var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
          // 提交时间过长加上Loading
          console.log(JSON.stringify(obj));
          wx.showLoading({
            title: '加载中',
            mask: true,
          })
          wx.request({
            url: app.urls.orderTempAdd,
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
              //console.log(res.data)
              wx.hideLoading();
              if (res.data.code == "0") {
                var userId = wx.getStorageSync("userId");
                app.GetPhoneNoFun(userId).then(data => {
                  if (data == '已绑定') {
                    wx.navigateTo({
                      url: '../temOrder/temOrder?tempOrderId=' + res.data.data
                    })
                  } else {
                    var weixinUserInfo = wx.getStorageSync("weixinUserInfo");
                    wx.navigateTo({
                      url: '../register/register?userId=' + userId + '&unionid='
                        + weixinUserInfo.unionid + '&openId=' + weixinUserInfo.openid + '&sqlid=' + '' + '&deviceid=' + '' + '&isQRCodeLogin=' + false + '&back=tempOrder' + '&tempOrderId=' + res.data.data
                    })
                  }
                }); 
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: "none",
                  duration: 2000
                });
              }
            },
            complete: function (com) {
              //token过期
              if (com.statusCode == 401) {
                // 重新获取token
                app.funGetToken();
              }
              that.setData({
                btn1: true
              });
            }
          })
        }
      } else {
        wx.showToast({
          title: "请选择结算的商品",
          icon: "none",
          duration: 3000
        })
      }
    } else {
      wx.showToast({
        title: "请选择结算的商品",
        icon: "none",
        duration: 3000
      })
    }
  },
  // 编辑和完成事件
  editComplete: function (event) {
    // 点击了编辑
    if (this.data.taggleBtnText == '编辑') {
      // 页面禁止滑动
      this.setData({ isEdit: true });
      // 重新获取列表 让滑动归位
      this.onShow();
      // 按钮文字改变
      this.setData({ taggleBtnText: "完成" });
      // 点击了完成
    } else if (this.data.taggleBtnText == '完成') {
      this.setData({ isEdit: false });
      this.setData({ taggleBtnText: "编辑" });
      wx.showToast({
        title: "编辑成功",
        icon: 'success',
        duration: 1500
      })
    }

  },
  min: function(e) {
    var btn1 = this.data.btn1;
    var context = this;
    if (btn1) {     
      // 循环购物车所有的店
      context.data.itemList.forEach((item) => {
          //找出当前需要修改的这一条item
        if (item.skuId == e.currentTarget.dataset.item.skuId) {
            if (item.count == 1) {
              return;
            }else{
              if (item.count >= 2) {
                item.count--;
                context.setData({
                  btn1: false
                })
              } 
            }
          
            wx.showLoading({
              title: '加载中',
            }); 
            // 执行编辑请求功能
            var AccessTokey = wx.getStorageSync("AccountTokenGet");
            var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
            var obj = {
              SkuId: item.skuId,
              Count: item.count,//更改的数量
              StoreId: item.storeId,
            };
            // 绑定优惠券
            var message = "编辑成功";
            wx.request({
              url: app.urls.GoodsEdit,
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
                wx.hideLoading();
                if (res.data.code == '0') {
                  context.setData(context.data);
                  context.getTotalPrice();
                } else {
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 1500
                  })
                  if (item.count >= 2) {
                    item.count++;
                  }
                  context.setData(context.data);
                  context.setData('isEditSuccess', true);
                  // 在获取一次购物车列表
                }
              },
              complete: function (com) {
                //token过期
                if (com.statusCode == 401) {
                  // 重新获取token
                  app.funGetToken();
                }
                context.setData({
                  btn1: true
                });
              }
            })
          }
      })
    }
  },
  add: function (e) {
    var btn1 = this.data.btn1;
    var context = this;
    // 防止重复点击
    if (btn1){
      context.setData({
        btn1: false
      })
      // 循环购物车所有的店
      context.data.itemList.forEach((v,i) => {
          //找出当前需要修改的这一条item
        if (v.skuId == e.currentTarget.dataset.item.skuId) {
            // 更改原有的商品数量
          if (v.count < 50) {
            v.count++;
          }
          wx.showLoading({
            title: '加载中',
          });
          var AccessTokey = wx.getStorageSync("AccountTokenGet");
          var token = AccessTokey.userToken.tokenType + ' ' + AccessTokey.userToken.accessToken;
          var obj = {
            SkuId: v.skuId,
            Count: v.count,//更改的数量
            StoreId: v.storeId,
            productId: v.productId,
          };
            //编辑购物车数量
            wx.request({
              url: app.urls.GoodsEdit,
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
                wx.hideLoading();
                if (res.data.code == '0') {
                  context.setData(context.data);
                  context.getTotalPrice();
                } else {
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 1500
                  })
                  if (v.count < 50) {
                    v.count--;
                  }
                  context.setData(context.data);
                }
              },
              complete: function (com) {
                //token过期
                if (com.statusCode == 401) {
                  // 重新获取token
                  app.funGetToken();
                }
                context.setData({
                  btn1: true
                });
              }
            })
          }
      })
    }
  },
  /**
  * 进入商品详情页
  */
  details: function (e) {
    var GoodsID = e.currentTarget.dataset.id;
    var storeId = e.currentTarget.dataset.storeid;
    var name = e.currentTarget.dataset.nama;
    var off = this.data.off;
    if (off) {
      console.log(GoodsID,storeId)
      // Shoe（鞋子），Goods（配件），Dress（衣服）
      if (name == "Goods") {
        wx.navigateTo({
          url: '../detailsVahooGoods/detailsVahooGoods?GoodsID=' + GoodsID + '&StoreID=' + storeId,
        })
      } else {
        wx.navigateTo({
          url: '../details/details?GoodsID=' + GoodsID + '&StoreID=' + storeId,
        })
      }
      this.setData({
        off: false
      })
    }
  }
})