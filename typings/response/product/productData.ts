export interface ProductData {
	id: number,
	productName: string,
	price: number,
	productImage: string,
	collect: boolean
	description: string,
	productType: number,
	productImageChoice: string,
	originalPrice: string,
	images: number,
	flowerLanguage: string
}

export interface ProductDataCount {
	id: number,
	productName: string,
	price: number,
	productImage: string,
	collect: boolean
	description: string,
	productType: number,
	productImageChoice: string,
	originalPrice: string,
	images: number,
	flowerLanguage: string,
	count: number,
	checked: boolean
}