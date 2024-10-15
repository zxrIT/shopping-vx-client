export function watch(context: any, variableName: string, callback: (newValue: any, oldValue: any) => void) {
	let value = context.data[variableName]
	Object.defineProperty(context.data, variableName, {
		configurable: true,
		enumerable: true,
		get: function () {
			return value
		},
		set: function (newValue) {
			const oldValue = value
			value = newValue;
			callback.call(context, newValue, oldValue)
		}
	})
}