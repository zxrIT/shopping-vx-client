import { getBaseUrl, requestFunction } from "../../utils/request"
import type { ResponseData } from "../../../typings/response/responseData"
import type { User } from "../../../typings/response/user/user"
import type { Address } from "../../../typings/response/address/address"

Page({
	login() {
		wx.switchTab({
			url: "/pages/profile/profile"
		})
	},
	navigateToAddressCU() {
		wx.navigateTo({
			url: "/pages/addressCU/addressCU?userId=" + this.data.userObject.id
		})
	},
	deleteAddress(event: any) {
		requestFunction<ResponseData<string>>({
			url: "http://localhost:8080/address/delete/" + this.data.userObject.id + "/" + event.mark.addressId,
			method: "GET"
		}).then(result => {
			if (result.code === 200) {
				wx.showToast({
					title: "删除成功",
					icon: "success"
				})
			}else{
				wx.showToast({
					title: "删除失败",
					icon: "error"
				})
			}
		})
		requestFunction<ResponseData<Array<Address>>>({
			url: "http://localhost:8080/address/findAll/" + this.data.userObject.id,
			method: "GET"
		}).then(result => {
			this.setData({
				addressList: result.data,
				addressListLength: result.data.length
			})
		})
	},
	setAcquiesce(event: any) {
		const addressObject: Address = event.mark.addressObject
		wx.setStorageSync("addressAcquiesce", addressObject.addressId)
		this.setData({
			acquiesceAddressId: addressObject.addressId
		})
		wx.showToast({
			title: "设置成功",
			icon: "success"
		})
	},
	navigateToAddressCUUpdate(event: any) {
		wx.navigateTo({
			url: "/pages/addressCU/addressCU?userId=" + this.data.userObject.id + "&typeId=update" + "&addressId=" + event.mark.addressId
		})
	},
	data: {
		userObject: {} as User,
		baseUrl: "" as String,
		loginStatus: false as boolean,
		addressList: [] as Array<Address>,
		addressListLength: 0 as number,
		startX: 0 as number,
		acquiesceAddressId: 0 as number
	},
	onLoad() {
		const userObject: User = wx.getStorageSync("userObject")
		this.setData({
			userObject: userObject,
			baseUrl: getBaseUrl(),
			loginStatus: (Object.keys(userObject).length === 0)
		})

		if (Object.keys(userObject).length === 0) {
			return;
		}
		requestFunction<ResponseData<Array<Address>>>({
			url: "http://localhost:8080/address/findAll/" + this.data.userObject.id,
			method: "GET"
		}).then(result => {
			this.setData({
				addressList: result.data,
				addressListLength: result.data.length
			})
		})
	},
	onShow() {
		const userObject: User = wx.getStorageSync("userObject")
		const addressAcquiesce: number = wx.getStorageSync("addressAcquiesce")
		this.setData({
			userObject: userObject,
			baseUrl: getBaseUrl(),
			loginStatus: (Object.keys(userObject).length === 0),
			acquiesceAddressId: addressAcquiesce ? addressAcquiesce : 0
		})

		if (Object.keys(userObject).length === 0) {
			return;
		}
		requestFunction<ResponseData<Array<Address>>>({
			url: "http://localhost:8080/address/findAll/" + this.data.userObject.id,
			method: "GET"
		}).then(result => {
			this.setData({
				addressList: result.data,
				addressListLength: result.data.length
			})
		})
	},
	touchStart(event: any) {
		this.setData({
			startX: event.touches[0].clientX
		})
	},
	touchEnd(event: any) {
		const endX: number = event.changedTouches[0].clientX
		const criticalPoint: number = 20
		const index = event.mark.index
		const { addressList } = this.data

		if (this.data.startX - endX >= criticalPoint) {
			addressList[index].isAction = true
		}
		if (endX - this.data.startX >= criticalPoint) {
			addressList[index].isAction = false
		}
		this.setData({
			addressList: addressList
		})
	}
})