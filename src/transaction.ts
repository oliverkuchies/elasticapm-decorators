import apm from "elastic-apm-node";
// biome-ignore lint/suspicious/noExplicitAny: Decorator requires any return type to work with various methods
export function ElasticTransaction(name: string, type: string): any {
	return (
		_target: unknown,
		_propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<unknown>,
	): TypedPropertyDescriptor<unknown> | undefined => {
		if (!descriptor || typeof descriptor.value !== "function") {
			throw new Error("ElasticTransaction can only be applied to methods.");
		}
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: unknown[]) {
			if (!apm.isStarted()) {
				return null;
			}

			const transaction = apm.startTransaction(name, type);
			const startTime = Date.now();
			let result: unknown;
			let error: unknown;

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
