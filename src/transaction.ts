import apm from "elastic-apm-node";

export function ElasticTransaction(name: string, type: string): any {
	return function (
		target: Object,
		propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<any>,
	): TypedPropertyDescriptor<unknown> | void {
		if (!descriptor || typeof descriptor.value !== "function") {
			throw new Error("ElasticTransaction can only be applied to methods.");
		}
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			if (!apm.isStarted()) {
				return null;
			}

			const transaction = apm.startTransaction(name, type);
			const startTime = Date.now();
			let result: any;
			let error: any;

			try {
				result = await originalMethod.apply(this, args);
			} catch (err) {
				error = err;
				if (transaction) {
					transaction.setOutcome(error ? "failure" : "success");
					transaction.addLabels({
						duration: Date.now() - startTime,
						error: error ? String(error) : "none",
					});
					transaction.end();
				}
				throw err;
			}
			return result;
		};
		return descriptor;
	};
}
