import { requestFunction } from "../../utils/request"
import type { ResponseData } from "../../../typings/response/responseData"
import type { User } from "../../../typings/response/user/user"

Page({
	data: {
		userObject: {} as User,
		userInfo: {},
	},
	navigateToAddress: function () {
		wx.navigateTo({
			url: "/pages/address/address?userId=" + this.data.userObject.id
		})
	},
	navigateToCollect: function () {
		wx.navigateTo({
			url: "/pages/collect/collect?userId=" + this.data.userObject.id
		})
	},
	login() {
		wx.getUserProfile({
			desc: "必须授权才能使用",
			success: (result) => {
				requestFunction<ResponseData<User>>({
					url: "http://localhost:8080/user/login/" + result.userInfo.nickName,
					method: "GET"
				}).then(resultUser => {
					this.setData({
						userInfo: result.userInfo,
						userObject: resultUser.data
					})
					wx.setStorageSync("userInfo", {
						...(result.userInfo)
					})
					wx.setStorageSync("userObject", {
						...(resultUser.data)
					})
				}).catch(() => {
					wx.showModal({
						title: "认证失败,请稍后重试"
					})
				})

			},
			fail: function () {
				wx.showModal({
					title: "认证失败,请稍后重试"
				})
			}
		})
	},
	logout() {
		this.setData({
			userInfo: {},
			userObject: {} as User
		})
		wx.removeStorageSync("userInfo")
		wx.removeStorageSync("userObject")
	},
	onLoad() {
		const userInfo = wx.getStorageSync("userInfo")
		const userObject = wx.getStorageSync("userObject")
		this.setData({
			userInfo: userInfo ? userInfo : {},
			userObject: userObject ? userObject : {},
		})
	}
})