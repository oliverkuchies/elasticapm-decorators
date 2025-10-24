import apm from "elastic-apm-node";

export function ElasticSpan(
	name: string,
	type: string,
	subtype: string = "",
	// biome-ignore lint/suspicious/noExplicitAny: Decorator requires any return type to work with various methods
): any {
	return (
		_target: unknown,
		_propertyKey: string,
		descriptor: PropertyDescriptor,
	) => {
		const originalMethod = descriptor.value;

		if (!apm.isStarted()) {
			return descriptor;
		}

		descriptor.value = function (...args: unknown[]) {
			const span = apm.startSpan(name, type, subtype);

			if (!span) {
				return originalMethod.apply(this, args);
			}

			const startTime = Date.now();
			let error: unknown;

			try {
				const result = originalMethod.apply(this, args);
				if (result && typeof result.then === "function") {
					// Async
					return result
						.then((res: unknown) => {
							span.setOutcome("success");
							span.addLabels({
								duration: Date.now() - startTime,
								error: "none",
							});
							span.end();
							return res;
						})
						.catch((err: unknown) => {
							error = err;
							span.setOutcome(error ? "failure" : "success");
							span.addLabels({
								duration: Date.now() - startTime,
								error: error ? String(error) : "none",
							});
							span.end();
							throw err;
						});
				} else {
					// Sync
					span.setOutcome("success");
					span.addLabels({
						duration: Date.now() - startTime,
						error: "none",
					});
					span.end();
					return result;
				}
			} catch (err) {
				error = err;
				span.setOutcome(error ? "failure" : "success");
				span.addLabels({
					duration: Date.now() - startTime,
					error: error ? String(error) : "none",
				});
				span.end();
				throw err;
			}
		};

		return descriptor;
	};
}

export { apm };
