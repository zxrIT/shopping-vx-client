import { requestFunction } from "../../utils/request"
import { watch } from "../../utils/watch"
import type { ResponseData } from "../../../typings/response/responseData"
import { Address } from "../../../typings/response/address/address";
import { User } from "../../../typings/response/user/user";
import { ShoppingCart, ShoppingCartProduct } from "../../../typings/response/shoppingCart/shoppingCart";
import { ProductDataCount } from "../../../typings/response/product/productData";

interface OrderData {
	id?: string;
	userId: string;
	totalAmount: number;
	orderStatus: number;
	address: string;
	contactPhone: string;
	contactName: string;
	products: Array<{
		productId: string;
		productName: string;
		productImage: string;
		price: number;
		quantity: number;
	}>;
}

Page({
	login() {
		wx.switchTab({
			url: "/pages/profile/profile"
		})
	},
	deleteShoppingCart(event: any) {
		this.showPopup()
		const tempObject: ProductDataCount[] = this.data.productObjectArray.filter((value: ProductDataCount) => {
			return value.id === event.mark.id
		})
		this.setData({
			tarnsformProductObject: tempObject[0]
		})
	},
	delete(event: any) {
		wx.showModal({
			title: "确认要删除吗",
			success: (result) => {
				if (result.confirm) {
					requestFunction<ResponseData<string>>({
						url: "http://localhost:8080/shoppingCart/deleteShoppingCartProduct/" + this.data.user.id + "/" + event.mark.id,
						method: "GET"
					}).then(result => {
						if (result.code === 200) {
							this.onShow()
							this.setData({
								popupClass: '',
								popupClassStatus: false
							})
							wx.showToast({
								title: "删除成功",
								icon: "success",
								duration: 3000,
							})
						}
					})
				}
			}
		})
	},
	operation(event: any) {
		const { id, type } = event.mark
		const productId = parseInt(id)

		// 找到要修改的商品
		const productIndex = this.data.productObjectArray.findIndex(item => item.id === productId)
		if (productIndex === -1) return

		const product = this.data.productObjectArray[productIndex]
		let newCount = product.count

		switch (type) {
			case "increment":
				newCount = product.count + 1
				break
			case "decement":
				newCount = Math.max(1, product.count - 1) // 确保数量不小于1
				break
		}

		// 如果数量没有变化，直接返回
		if (newCount === product.count) return

		// 更新后端数据
		requestFunction<ResponseData<string>>({
			url: `http://localhost:8080/shoppingCart/updateProductCount/${this.data.user.id}/${productId}/${newCount}`,
			method: "GET"
		}).then(result => {
			if (result.code === 200) {
				// 更新本地数据
				const newProductArray = [...this.data.productObjectArray]
				newProductArray[productIndex] = {
					...product,
					count: newCount
				}

				this.setData({
					productObjectArray: newProductArray,
					productObjectCountChangeStatus: !this.data.productObjectCountChangeStatus
				})

				// 数量变化时重新计算总价
				this.calculateTotal()
			} else {
				wx.showToast({
					title: '更新数量失败',
					icon: 'error'
				})
			}
		}).catch(() => {
			wx.showToast({
				title: '更新数量失败',
				icon: 'error'
			})
		})
	},
	navigateToChoiceAddress() {
		wx.navigateTo({
			url: "/pages/address/address"
		})
	},
	navigateToDetails(event: any) {
		wx.navigateTo({
			url: "/pages/detail/detail?id=" + event.mark.id
		})
	},
	changeCheckedAll(event: any) {
		const newCheckedStatus = !event.mark.status
		const newProductArray = this.data.productObjectArray.map(item => ({
			...item,
			checked: newCheckedStatus
		}))

		this.setData({
			productObjectArray: newProductArray,
			allChecked: newCheckedStatus
		})

		this.calculateTotal()
	},
	changeProductCheckedStatus(event: any) {
		const { id } = event.mark
		const newProductArray = this.data.productObjectArray.map(item => 
			item.id === id ? { ...item, checked: !item.checked } : item
		)

		this.setData({
			productObjectArray: newProductArray
		})

		this.calculateTotal()
	},
	showPopup: function () {
		this.setData({
			popupClass: 'slide-up',
			popupClassStatus: true
		});
	},
	hidePopup: function () {
		this.setData({
			popupClass: '',
			popupClassStatus: false
		});
	},
	async createOrder() {
		if (!this.data.addressStatus) {
			wx.showToast({
				title: '请选择收货地址',
				icon: 'none'
			})
			return
		}

		if (this.data.prodectNumber === 0) {
			wx.showToast({
				title: '请选择要购买的商品',
				icon: 'none'
			})
			return
		}

		try {
			wx.showLoading({
				title: '提交订单中...'
			})

			// 收集选中的商品信息
			const selectedProducts = this.data.productObjectArray
				.filter(item => item.checked)
				.map(item => ({
					productId: String(item.id),
					productName: item.productName,
					productImage: item.productImageChoice,
					price: item.price,
					quantity: item.count
				}))

			const orderData: OrderData = {
				userId: this.data.user.id,
				totalAmount: this.data.priceCount,
				orderStatus: 0, // 待付款
				address: this.data.addressObject.addressContent,
				contactPhone: this.data.addressObject.mobile,
				contactName: this.data.addressObject.username,
				products: selectedProducts
			}

			const result = await requestFunction<ResponseData<string>>({
				url: 'http://localhost:8080/order/createOrder',
				method: 'POST',
				data: orderData
			})

			if (result.code === 200) {
				try {
					// 清空购物车
					const clearResult = await requestFunction<ResponseData<string>>({
						url: `http://localhost:8080/shoppingCart/clearShoppingCart/${this.data.user.id}`,
						method: 'DELETE'
					})

					if (clearResult.code === 200) {
						// 更新本地数据
						const newProductArray = this.data.productObjectArray.filter(item => !item.checked)
						
						this.setData({
							productObjectArray: newProductArray,
							allChecked: false,
							priceCount: 0,
							prodectNumber: 0
						})

						wx.hideLoading()
						wx.showToast({
							title: '下单成功',
							icon: 'success'
						})

						// 延迟跳转到订单页面
						setTimeout(() => {
							wx.navigateTo({
								url: '/pages/orders/orders'
							})
						}, 1500)
					} else {
						wx.hideLoading()
						wx.showToast({
							title: '清空购物车失败',
							icon: 'error'
						})
					}
				} catch (error) {
					wx.hideLoading()
					wx.showToast({
						title: '清空购物车失败',
						icon: 'error'
					})
					// 刷新购物车列表
					this.onShow()
				}
			} else {
				wx.hideLoading()
				wx.showToast({
					title: result.message || '下单失败',
					icon: 'error'
				})
			}
		} catch (error) {
			wx.hideLoading()
			wx.showToast({
				title: '下单失败',
				icon: 'error'
			})
		}
	},
	data: {
		popupClass: "",
		user: {} as User,
		popupClassStatus: false as boolean,
		tarnsformProductObject: {} as ProductDataCount,
		priceCount: 0 as number,
		prodectNumber: 0 as number,
		productObjectCountChangeStatus: false as boolean,
		addressStatus: false as boolean,
		loginStatus: true as boolean,
		addressObject: {} as Address,
		shoppingCartObject: {} as ShoppingCart,
		shoppingCartProductIdArray: [] as number[],
		productObject: {} as ShoppingCartProduct,
		productObjectArray: [] as ProductDataCount[],
		allChecked: false as boolean
	},
	calculateTotal() {
		const { productObjectArray } = this.data
		if (!Array.isArray(productObjectArray) || productObjectArray.length === 0) {
			this.setData({
				prodectNumber: 0,
				priceCount: 0,
				allChecked: false
			})
			return
		}

		const prodectNumber = productObjectArray.reduce((total, item) => {
			return item.checked ? total + (item.count || 0) : total
		}, 0)

		const priceCount = productObjectArray.reduce((total, item) => {
			return item.checked ? total + ((item.price || 0) * (item.count || 0)) : total
		}, 0)

		const allChecked = productObjectArray.length > 0 && 
			productObjectArray.every(item => item.checked)

		this.setData({
			prodectNumber,
			priceCount,
			allChecked
		})
	},
	async onShow() {
		const addressId: number = wx.getStorageSync("addressAcquiesce")
		const userObject: User = wx.getStorageSync("userObject")
		
		this.setData({
			user: userObject,
			addressStatus: !!addressId,
			loginStatus: Object.keys(userObject).length !== 0,
			// 重置购物车相关数据
			productObjectArray: [],
			shoppingCartProductIdArray: [],
			allChecked: false,
			priceCount: 0,
			prodectNumber: 0
		})

		if (!this.data.loginStatus) {
			return
		}

		try {
			// 并行加载地址和购物车数据
			const [addressResult, cartResult] = await Promise.all([
				requestFunction<ResponseData<Address>>({
					url: `http://localhost:8080/address/findAddress/${userObject.id}/${addressId}`,
					method: "GET"
				}),
				requestFunction<ResponseData<ShoppingCart>>({
					url: `http://localhost:8080/shoppingCart/getAll/${userObject.id}`,
					method: "GET"
				})
			])

			if (addressResult.code === 200) {
				this.setData({
					addressObject: addressResult.data
				})
			}

			if (cartResult.code === 200) {
				const { id, userId, ...products } = cartResult.data
				const productIds: number[] = []
				
				// 只收集有效的商品ID
				Object.entries(products).forEach(([key, value]) => {
					if (typeof value === 'number' && value > 0) {
						const productId = parseInt(key.replace('product', ''))
						if (!isNaN(productId) && !productIds.includes(productId)) {
							productIds.push(productId)
						}
					}
				})

				if (productIds.length === 0) {
					return
				}

				try {
					// 并行获取所有商品详情
					const productDetailsPromises = productIds.map(productId =>
						requestFunction<ResponseData<ProductDataCount>>({
							url: `http://localhost:8080/product/getProductDetails/${productId}`,
							method: "GET"
						})
					)

					const productDetails = await Promise.all(productDetailsPromises)
					const productObjectList = productDetails
						.filter(result => result.code === 200 && result.data)
						.map(result => ({
							...result.data,
							count: 1, // 固定初始数量为1
							checked: false
						}))

					if (productObjectList.length > 0) {
						this.setData({
							shoppingCartObject: cartResult.data,
							productObject: products as ShoppingCartProduct,
							productObjectArray: productObjectList,
							shoppingCartProductIdArray: productIds
						})

						// 初始化时计算总价和数量
						this.calculateTotal()
					}
				} catch (error) {
					console.error('获取商品详情失败:', error)
					wx.showToast({
						title: '获取商品详情失败',
						icon: 'error'
					})
				}
			}
		} catch (error) {
			console.error('加载购物车失败:', error)
			wx.showToast({
				title: '加载购物车失败',
				icon: 'error'
			})
		}
	}
})