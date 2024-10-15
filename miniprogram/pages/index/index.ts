import { requestFunction, getBaseUrl } from "../../utils/request"
import type { ResponseData } from "../../../typings/response/responseData"
import type { ProductData } from "../../../typings/response/product/productData"

Page({
	data: {
		baseUrl: "" as string,
		hotProductData: [] as ProductData[],
		otherProductData: [] as ProductData[]
	},
	onLoad: function () {
		const baseUrl: string = getBaseUrl()
		this.setData({
			baseUrl: baseUrl
		})
		requestFunction<ResponseData<ProductData[]>>({
			url: "http://localhost:8080/product/getHotProduct"
			, method: "GET"
		}).then(result => {
			const productList = (result.data.map((value: ProductData) => {
				value.productImage = this.data.baseUrl + "/static/hot/" + value.productImage
				return value
			}) as unknown) as ProductData[]
			this.setData({
				hotProductData: productList
			})
		})
		requestFunction<ResponseData<ProductData[]>>({
			url: "http://localhost:8080/product/getOtherProduct",
			method: "GET"
		}).then(result => {
			const otherProduct = (result.data.map((value: ProductData) => {
				value.productImage = this.data.baseUrl + "/static/other/" + value.productImage
				return value
			}) as unknown) as ProductData[]
			this.setData({
				otherProductData: otherProduct
			})
		})
	},
	navigateTo: function navigateTo() {
		wx.switchTab({
			url: "/pages/cate/cate"
		})
	}
})
