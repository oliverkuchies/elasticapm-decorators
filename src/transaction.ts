import apm from "elastic-apm-node";
// biome-ignore lint/suspicious/noExplicitAny: Decorator requires any return type to work with various methods
export function ElasticTransaction(name: string, type: string): any {
	return (
		_target: unknown,
		_propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<unknown>,
	): TypedPropertyDescriptor<unknown> | undefined => {
		const originalMethod = descriptor.value as (
			...args: unknown[]
		) => Promise<unknown>;

		if (!apm.isStarted()) {
			return descriptor;
		}

		descriptor.value = async function (...args: unknown[]) {
			const transaction = apm.startTransaction(name, type);

			if (!transaction) {
				return originalMethod.apply(this, args);
			}

			const startTime = Date.now();
			let result: unknown;
			let error: unknown;

			try {
				result = await originalMethod.apply(this, args);
			} catch (err) {
				error = err;
				transaction.setOutcome(error ? "failure" : "success");
				transaction.addLabels({
					duration: Date.now() - startTime,
					error: error ? String(error) : "none",
				});
				transaction.end();
				throw err;
			}
			return result;
		};
		return descriptor;
	};
}
