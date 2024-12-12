import { ProductData } from "../../../typings/response/product/productData"
import { ResponseData } from "../../../typings/response/responseData"
import { User } from "../../../typings/response/user/user"
import { requestFunction } from "../../utils/request"

Page({
	addShoppingCart(event: any) {
		requestFunction<ResponseData<string>>({
			url: "http://localhost:8080/shoppingCart/addShoppingCartProduct/" + this.data.userObject.id + "/" + event.mark.id,
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
	navigateToDetail(event: any) {
		wx.navigateTo({
			url: "/pages/detail/detail?id=" + event.mark.id
		})
	},
	login() {
		wx.switchTab({
			url: "/pages/profile/profile"
		})
	},
	data: {
		userObject: {} as User,
		loginStatus: false as boolean,
		collectList: [] as Array<ProductData>
	},
	onShow() {
		const userObejct: User = wx.getStorageSync("userObject")
		this.setData({
			userObject: userObejct ? userObejct : {} as User,
		})
		if (Object.keys(userObejct).length > 0) {
			this.setData({
				loginStatus: true
			})
			requestFunction<ResponseData<Array<ProductData>>>({
				url: "http://localhost:8080/collect/getAllCollect/" + userObejct.id,
				method: "GET"
			}).then(result => {
				this.setData({
					collectList: result.data
				})
			})
			return;
		}
	}
})