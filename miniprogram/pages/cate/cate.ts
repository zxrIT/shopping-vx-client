import { getBaseUrl, requestFunction } from "../../utils/request"
import { watch } from "../../utils/watch"
import type { ProductData } from "../../../typings/response/product/productData"
import type { ResponseData } from "../../../typings/response/responseData"
import type { ProductType } from "../../../typings/response/product/productType"

Page({
	changeChoiceStatus(event: any) {
		this.setData({
			productTypeChoiceStatus: event.mark.id
		})
	},
	data: {
		productActionStyle: "background-color: #f3514f;color: black;",
		productTypeChoiceStatus: 0 as number,
		baseUrl: "" as string,
		productTypeData: [] as ProductType[],
		productList: [] as ProductData[]
	},
	onLoad: function () {
		const url: string = getBaseUrl()
		watch(this, "productTypeChoiceStatus", (newValue) => {
			requestFunction<ResponseData<ProductData[]>>({
				url: "http://localhost:8080/product/getProduct/" + newValue,
				method: "GET"
			}).then(result => {
				this.setData({
					productList: result.data
				})
			})
		})
		this.setData({
			productTypeChoiceStatus: 1000,
			baseUrl: url
		})
		requestFunction<ResponseData<ProductType[]>>({
			url: "http://localhost:8080/product/getProductType",
			method: "GET"
		}).then(result => {
			const productAll: ProductType = {
				id: 1000,
				typeName: "全部",
				typeImage: "1000.png"
			}
			result.data.unshift(productAll)
			this.setData({
				productTypeData: result.data
			})
		})
	}
})