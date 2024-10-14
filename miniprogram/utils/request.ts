const baseUrl: string = "http://localhost:8080"

export function getBaseUrl(): string {
	return baseUrl
}
export function requestFunction<T>(params: any): Promise<T> {
	return new Promise((resolve, reject) => {
		wx.request({
			...params,
			success: (result) => {
				resolve((((result) as any).data) as T)
			},
			fail: (error: any) => {
				reject(error)
			}
		})
	})
}