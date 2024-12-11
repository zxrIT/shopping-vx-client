import { requestFunction } from "../../utils/request"
import { watch } from "../../utils/watch"
import type { ResponseData } from "../../../typings/response/responseData"
import { Address } from "../../../typings/response/address/address";
import { User } from "../../../typings/response/user/user";
import { ShoppingCart, ShoppingCartProduct } from "../../../typings/response/shoppingCart/shoppingCart";
import { ProductDataCount } from "../../../typings/response/product/productData";
Page({
	login() {
		wx.switchTab({
			url: "/pages/profile/profile"
		})
	},
	operation(event: any) {
		switch (event.mark.type) {
			case "increment":
				const tempProductObjectArray: ProductDataCount[] = this.data.productObjectArray.map((value: ProductDataCount) => {
					if (value.id === event.mark.id) {
						value.count++
					}
					return value
				})
				this.setData({
					productObjectCountChangeStatus: !this.data.productObjectCountChangeStatus,
					productObjectArray: tempProductObjectArray
				})
				break;
			case "decement":
				const tempdecProductObjectArray: ProductDataCount[] = this.data.productObjectArray.map((value: ProductDataCount) => {
					if (value.id === event.mark.id && value.count - 1 >= 1) {
						value.count--
					}
					return value
				})
				this.setData({
					productObjectCountChangeStatus: !this.data.productObjectCountChangeStatus,
					productObjectArray: tempdecProductObjectArray
				})
		}
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
	changeCheckedAll(event:any){
		this.setData({
			productObjectArray:this.data.productObjectArray.map((value: ProductDataCount)=>{
				value.checked=!event.mark.status
				return value
			}),
			allChecked:!event.mark.status,
			productObjectCountChangeStatus: !this.data.productObjectCountChangeStatus
		})
	},
	changeProductCheckedStatus(event: any) {
		this.setData({
			productObjectArray: this.data.productObjectArray.map((value: ProductDataCount) => {
				if (value.id === event.mark.id) {
					value.checked = !value.checked
				}
				return value
			}),
			productObjectCountChangeStatus: !this.data.productObjectCountChangeStatus
		})
	},
	data: {
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
	onShow() {
		const addressId: number = wx.getStorageSync("addressAcquiesce")
		const userObject: User = wx.getStorageSync("userObject")
		if (addressId) {
			this.setData({
				addressStatus: true
			})
		}
		if (Object.keys(userObject).length === 0) {
			this.setData({
				loginStatus: false
			})
		}
		requestFunction<ResponseData<Address>>({
			url: "http://localhost:8080/address/findAddress/" + userObject.id + "/" + addressId,
			method: "GET"
		}).then((result) => {
			this.setData({
				addressObject: result.data
			})
		})
		requestFunction<ResponseData<ShoppingCart>>({
			url: "http://localhost:8080/shoppingCart/getAll/" + userObject.id,
			method: "GET"
		}).then((result) => {
			const { id, userId, ...products } = result.data
			const productCountArray: number[] = []
			const productObjectList: ProductDataCount[] = []
			this.setData({
				shoppingCartObject: result.data,
				productObject: products as ShoppingCartProduct
			})
			Object.values(products).forEach((value: number) =>
				value !== 0 && productCountArray.push(value))
			productCountArray.forEach((value) => {
				requestFunction<ResponseData<ProductDataCount>>({
					url: "http://localhost:8080/product/getProductDetails/" + value,
					method: "GET"
				}).then((result) => {
					result.data.count = 1
					result.data.checked = false
					productObjectList.push(result.data)
					this.setData({
						productObjectArray: productObjectList
					})
				})
			})
			this.setData({
				shoppingCartProductIdArray: productCountArray
			})
		})
		watch(this, "productObjectCountChangeStatus", () => {
			this.setData({
				prodectNumber: this.data.productObjectArray.reduce((pre: number, curr: ProductDataCount) => {
					return curr.checked ? pre += curr.count : pre
				}, 0),
				priceCount: this.data.productObjectArray.reduce((pre: number, curr: ProductDataCount) => {
					return curr.checked ? pre += (curr.price) * (curr.count) : pre
				}, 0),
				allChecked:(this.data.productObjectArray.reduce((_,curr: ProductDataCount)=>{
					return !curr.checked?0:1
				},0))===1
			})
		})
		this.setData({
			productObjectCountChangeStatus: !this.data.productObjectCountChangeStatus
		})
	}
})