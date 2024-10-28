import { requestFunction } from "../../utils/request"
import { ADDRESS_TOPIC } from "../../object/address/address"
import type { ResponseData } from "../../../typings/response/responseData"
import { Address } from "../../../typings/response/address/address"

Page({
	data: {
		addressId: 0 as number,
		typeId: "" as string,
		userId: "" as string,
		buttonTitle: "" as string,
		addressTopic: "1" as string,
		topic: "家" as string,
		addressTopicChoiceStyle: "color:#f3514f;border:1px solid #f3514f;",
		username: "" as string,
		sex: "" as string,
		mobile: "" as string,
		address: "" as string,
		houseNumber: "" as string
	},
	changeUsername(event: any) {
		this.setData({
			username: event.detail.value
		})
	},
	handleSex(event: any) {
		this.setData({
			sex: event.detail.value
		})
	},
	changeMobile(event: any) {
		this.setData({
			mobile: event.detail.value
		})
	},
	getAddress() {
		wx.chooseLocation({
			success: result => {
				this.setData({
					address: result.address + result.name
				})
			}
		})
	},
	getHouseNumber(event: any) {
		this.setData({
			houseNumber: event.detail.value
		})
	},
	getUserNumber(event: any) {
		wx.getUserProfile({
			desc: "获取手机号",
			success: (result) => {
				console.log(result)
			}
		})
	},
	changeAddressTopic(event: any) {
		for (let [key, value] of Object.entries(ADDRESS_TOPIC)) {
			if (key === event.mark.id) {
				this.setData({
					topic: value
				})
			}
		}
		this.setData({
			addressTopic: event.mark.id,
		})
	},
	updateAddress() {
		if (/^1[3456789]\d{9}$/.test(this.data.mobile)) {
			if (this.data.username.length !== 0) {
				if (this.data.sex.length !== 0) {
					if (this.data.address.length !== 0 && this.data.houseNumber.length !== 0) {
						requestFunction<ResponseData<string>>({
							url: "http://localhost:8080/address/update/" + this.data.userId + "/" + this.data.addressId + "/" + this.data.topic + "/" + this.data.address + "(" + this.data.houseNumber + ")" + "/" + this.data.username + "/" + this.data.sex + "/" + this.data.mobile,
							method: "GET"
						}).then(result => {
							if (result.code === 200) {
								wx.showToast({
									title: result.data,
									icon: "success"
								})
							} else {
								wx.showToast({
									title: result.data,
									icon: "error"
								})
							}
						})
						return;
					}
					wx.showToast({
						title: "收货地不能为空",
						icon: "error"
					})
					return;
				}
				wx.showToast({
					title: "性别不能为空",
					icon: "error"
				})
				return;
			}
			wx.showToast({
				title: "联系人不能为空",
				icon: "error"
			})
			return;
		}
		wx.showToast({
			title: "手机号格式有误",
			icon: "error"
		})
	},
	createAddress() {
		if (/^1[3456789]\d{9}$/.test(this.data.mobile)) {
			if (this.data.username.length !== 0) {
				if (this.data.sex.length !== 0) {
					if (this.data.address.length !== 0 && this.data.houseNumber.length !== 0) {
						requestFunction<ResponseData<string>>({
							url: "http://localhost:8080/address/addAddress/" + this.data.userId + "/" + this.data.topic + "/" + this.data.address + "(" + this.data.houseNumber + ")" + "/" + this.data.username + "/" + this.data.sex + "/" + this.data.mobile,
							method: "GET"
						}).then(result => {
							if (result.code === 200) {
								wx.showToast({
									title: result.data,
									icon: "success"
								})
							} else {
								wx.showToast({
									title: result.data,
									icon: "error"
								})
							}
						})
						return;
					}
					wx.showToast({
						title: "收货地不能为空",
						icon: "error"
					})
					return;
				}
				wx.showToast({
					title: "性别不能为空",
					icon: "error"
				})
				return;
			}
			wx.showToast({
				title: "联系人不能为空",
				icon: "error"
			})
			return;
		}
		wx.showToast({
			title: "手机号格式有误",
			icon: "error"
		})
	},
	onLoad(options: any) {
		if (options.typeId === "update") {
			requestFunction<ResponseData<Address>>({
				url: "http://localhost:8080/address/findAddress/" + options.userId + "/" + options.addressId,
				method: "GET"
			}).then(result => {
				const regex = /\([^)]*\)$/;
				const match = result.data.addressContent.match(regex);
				this.setData({
					username: result.data.username,
					sex: result.data.sex,
					mobile: result.data.mobile,
					topic: result.data.topic,
					address: result.data.addressContent.substring(0, match!.index),
					houseNumber: result.data.addressContent.substring(((match!.index) as number) + 1, result.data.addressContent.length - 1)
				})
				for (let [key, value] of Object.entries(ADDRESS_TOPIC)) {
					if (value === result.data.topic) {
						this.setData({
							addressTopic: key
						})
					}
				}
			})
		}
		this.setData({
			userId: options.userId,
			typeId: options.typeId,
			addressId: parseInt(options.addressId)
		})
	}
})