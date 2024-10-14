Page({
	handleFunction(event: any) {
		console.log(event.target.dataset.name)
	},
	handleFunctionFather(event: any) {
		console.log(event.currentTarget)
	},
	data: {
		object: [
			{ id: 1, title: "index1" },
			{ id: 2, title: "index2" },
			{ id: 3, title: "index3" }
		]
	}
})