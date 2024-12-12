import { requestFunction, getBaseUrl } from "../../utils/request"
import { watch } from "../../utils/watch"
import type { User } from "../../../typings/response/user/user"
import type { ResponseData } from "../../../typings/response/responseData"
import type { ProductData } from "../../../typings/response/product/productData"

Page({
	addShoppingCart() {
		console.log(this.data.imagesId);
		console.log(this.data.user.id);
		requestFunction<ResponseData<string>>({
			url: "http://localhost:8080/shoppingCart/addShoppingCartProduct/" + this.data.user.id + "/" + this.data.imagesId,
			method: "GET"
		}).then(result => {
			if (result.code === 200) {
				wx.showToast({
					icon: "success",
					title: result.data
				})
			} else if (result.code === 500) {
				wx.showToast({
					icon: "error",
					title: result.data
				})
			}
		})
	},
	onShareAppMessage: function () {
		return {
			title: "花坊" + this.data.productDetail.productName,
			path: "/pages/detail/detail?" + this.data.imagesId
		}
	},
	addCollect: function () {
		if (!this.data.productCollectStatus) {
			if (Object.keys(this.data.user).length === 0) {
				wx.showModal({
					title: "请先登录再进行收藏",
					success: (result) => {
						if (result.confirm) {
							wx.switchTab({
								url: "/pages/profile/profile"
							})
						}
					}
				})
			}
			requestFunction<ResponseData<string>>({
				url: "http://localhost:8080/collect/add/" + this.data.user.id + "/" + this.data.imagesId,
				method: "GET"
			}).then(result => {
				if (result.code === 200) {
					wx.showToast({
						title: result.data,
						icon: 'success'
					})
					this.setData({
						addCollectStatus: !this.data.addCollectStatus
					})
				} else {
					wx.showToast({
						title: result.data,
						icon: 'error'
					})
				}
			})
			return;
		}
		requestFunction<ResponseData<string>>({
			url: "http://localhost:8080/collect/delete/" + this.data.user.id + "/" + this.data.imagesId,
			method: "GET"
		}).then(result => {
			wx.showToast({
				title: result.data,
				icon: "success"
			})
			this.setData({
				productCollectStatus: false
			})
		})
	},
	navigate: function navigate() {
		wx.switchTab({
			url: "/pages/index/index"
		})
	},
	navigateService: function () {
		wx.switchTab({
			url: "/pages/profile/profile"
		})
	},
	data: {
		productCollectStatus: false as boolean,
		addCollectStatus: false,
		userCollect: [] as Array<number>,
		user: {} as User,
		baseUrl: "" as string,
		imagesId: "1" as string,
		productDetail: {} as ProductData
	},
	onLoad(options: any) {
		const url: string = getBaseUrl()
		const userObejct = wx.getStorageSync("userObject")
		this.setData({
			user: userObejct ? userObejct : {},
			baseUrl: url,
			imagesId: options.id
		})

		if (userObejct) {
			watch(this, "addCollectStatus", () => {
				requestFunction<ResponseData<Array<number>>>({
					url: "http://localhost:8080/collect/all/"
						+ userObejct.id,
					method: "GET"
				}).then(result => {
					result.data.forEach((value: number) => {
						if (String(value) === options.id) {
							this.setData({
								productCollectStatus: true
							})
						}
						return;
					})
					this.setData({
						userCollect: result.data
					})
				})
			})
			this.setData({
				addCollectStatus: !this.data.addCollectStatus
			})
		}

		requestFunction<ResponseData<ProductData>>({
			url: "http://localhost:8080/product/getProductDetails/" + options.id,
			method: "GET"
		}).then(result => {
			this.setData({
				productDetail: result.data
			})
		})
	}
})