Page({
	handleFunction(event: any) {
		console.log(event.target.dataset.name)
	},
	handleFunctionFather(event: any) {
		console.log(event.currentTarget)
	}
})