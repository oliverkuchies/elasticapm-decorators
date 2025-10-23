import apm from "elastic-apm-node";

export function ElasticSpan(name: string, type: string, subtype: string = "") : any {
	return function (
		target: unknown,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: unknown[]) {
			if (!apm.isStarted()) {
				return null;
			}

			const span = apm.startSpan(name, type, subtype);

			const startTime = Date.now();
			let result: unknown;
			let error: unknown;

			try {
				result = await originalMethod.apply(this, args);
			} catch (err) {
				error = err;
				if (span) {
					span.setOutcome(error ? "failure" : "success");
					span.addLabels({
						duration: Date.now() - startTime,
						error: error ? String(error) : "none",
					});

					span.end();
				}

				throw err;
			}

			return result;
		};
		return descriptor;
	};
}
