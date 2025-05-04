import { requestFunction } from "../../utils/request"
import type { ResponseData } from "../../../typings/response/responseData"

interface OrderProduct {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  orderStatus: number;
  address: string;
  contactPhone: string;
  contactName: string;
  createTime: string;
  updateTime: string;
  products: OrderProduct[];
}

const orderStatusMap = {
  0: '待付款',
  1: '已付款',
  2: '已发货',
  3: '已完成',
  4: '已取消'
}

Page({
  data: {
    orders: [] as Order[],
    userObject: {} as any,
    orderStatusMap
  },

  onLoad() {
    // 从本地存储获取用户信息
    const userObject = wx.getStorageSync("userObject")
    this.setData({
      userObject
    })
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.loadOrders()
  },

  async loadOrders() {
    if (!this.data.userObject.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.stopPullDownRefresh()
      return
    }

    try {
      const result = await requestFunction<ResponseData<Order[]>>({
        url: `http://localhost:8080/order/getOrdersByUserId/${this.data.userObject.id}`,
        method: "GET"
      })

      if (result.code === 200) {
        this.setData({
          orders: result.data
        })
      } else {
        wx.showToast({
          title: result.message || '加载订单失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '加载订单失败',
        icon: 'none'
      })
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  async payOrder(e: WechatMiniprogram.CustomEvent) {
    const orderId = e.currentTarget.dataset.id
    try {
      // TODO: 调用支付接口
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      })
      this.loadOrders()
    } catch (error) {
      wx.showToast({
        title: '支付失败',
        icon: 'none'
      })
    }
  },

  async confirmReceive(e: WechatMiniprogram.CustomEvent) {
    const orderId = e.currentTarget.dataset.id
    try {
      // TODO: 确认收货接口
      wx.showToast({
        title: '确认收货成功',
        icon: 'success'
      })
      this.loadOrders()
    } catch (error) {
      wx.showToast({
        title: '确认收货失败',
        icon: 'none'
      })
    }
  }
}) 