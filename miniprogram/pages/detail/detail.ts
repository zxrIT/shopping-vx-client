import { requestFunction, getBaseUrl } from "../../utils/request"
import type { ResponseData } from "../../../typings/response/responseData"
import type { ProductData } from "../../../typings/response/product/productData"

Page({
	onShareAppMessage: function () {
		return {
			title: "花坊" + this.data.productDetail.productName,
			path: "/pages/detail/detail?" + this.data.imagesId
		}
	},
	navigate: function navigate() {
		wx.switchTab({
			url: "/pages/index/index"
		})
	},
	data: {
		baseUrl: "" as string,
		imagesId: 1 as number,
		productDetail: {} as ProductData
	},
	onLoad(options: any) {
		const url: string = getBaseUrl()
		this.setData({
			baseUrl: url,
			imagesId: options.id
		})
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