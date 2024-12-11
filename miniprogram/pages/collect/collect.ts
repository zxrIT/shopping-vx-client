import { ProductData } from "../../../typings/response/product/productData"
import { ResponseData } from "../../../typings/response/responseData"
import { User } from "../../../typings/response/user/user"
import { requestFunction } from "../../utils/request"

Page({
	addShopping(event: any) {
		wx.switchTab({
			url: "/pages/cart/cart?id=" + event.mark.id
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
			user: userObejct ? userObejct : {},
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