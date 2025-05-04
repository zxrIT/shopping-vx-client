import { requestFunction } from "../../utils/request"
import { ADDRESS_TOPIC, AddressTopicValue } from "../../object/address/address"
import type { ResponseData } from "../../../typings/response/responseData"
import type { Address } from "../../../typings/response/address/address"

interface AddressOptions {
	userId: string;
	typeId: string;
	addressId?: string;
}

interface AddressEvent extends WechatMiniprogram.BaseEvent {
	mark: {
		id: string;
	};
	detail: {
		value: string;
	};
}

Page({
	data: {
		addressId: 0 as number,
		typeId: "" as string,
		userId: "" as string,
		buttonTitle: "" as string,
		addressTopic: "1" as string,
		topic: "家" as AddressTopicValue,
		addressTopicChoiceStyle: "color:#f3514f;border:1px solid #f3514f;",
		username: "" as string,
		sex: "先生" as string,
		mobile: "" as string,
		address: "" as string,
		houseNumber: "" as string
	},
	changeUsername(event: AddressEvent) {
		this.setData({
			username: event.detail.value
		})
	},
	handleSex(event: AddressEvent) {
		this.setData({
			sex: event.detail.value
		})
	},
	changeMobile(event: AddressEvent) {
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
	getHouseNumber(event: AddressEvent) {
		this.setData({
			houseNumber: event.detail.value
		})
	},
	getUserNumber() {
		wx.getUserProfile({
			desc: "获取手机号",
			success: (result) => {
				console.log(result)
			}
		})
	},
	changeAddressTopic(event: AddressEvent) {
		const id = event.mark.id;
		const value = ADDRESS_TOPIC[id as keyof typeof ADDRESS_TOPIC];
		
		this.setData({
			addressTopic: id,
			topic: value
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
	onLoad(options: Record<string, string | undefined>) {
		const addressOptions: AddressOptions = {
			userId: options.userId as string,
			typeId: options.typeId as string,
			addressId: options.addressId
		};

		this.setData({
			userId: addressOptions.userId,
			typeId: addressOptions.typeId,
			addressId: parseInt(addressOptions.addressId || '0')
		})

		if (addressOptions.typeId === "update" && addressOptions.addressId) {
			wx.showLoading({
				title: '加载中'
			})
			requestFunction<ResponseData<Address>>({
				url: "http://localhost:8080/address/findAddress/" + addressOptions.userId + "/" + addressOptions.addressId,
				method: "GET"
			}).then(result => {
				if (result.code === 200 && result.data) {
					const regex = /\([^)]*\)$/;
					const match = result.data.addressContent.match(regex);
					if (match && match.index !== undefined) {
						this.setData({
							username: result.data.username,
							sex: result.data.sex,
							mobile: result.data.mobile,
							topic: result.data.topic as AddressTopicValue,
							address: result.data.addressContent.substring(0, match.index),
							houseNumber: result.data.addressContent.substring(match.index + 1, result.data.addressContent.length - 1)
						})
						
						for (const [key, value] of Object.entries(ADDRESS_TOPIC)) {
							if (value === result.data.topic) {
								this.setData({
									addressTopic: key
								})
							}
						}
					}
				} else {
					wx.showToast({
						title: '加载失败',
						icon: 'error'
					})
				}
				wx.hideLoading()
			}).catch(() => {
				wx.hideLoading()
				wx.showToast({
					title: '网络错误',
					icon: 'error'
				})
			})
		}
	}
})