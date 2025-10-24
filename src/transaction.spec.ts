import apm, { type Transaction } from "elastic-apm-node";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ElasticTransaction } from "./transaction";

describe("ElasticTransaction", () => {
	let setOutcome: ReturnType<typeof vi.fn>;
	let addLabels: ReturnType<typeof vi.fn>;
	let end: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		setOutcome = vi.fn();
		addLabels = vi.fn();
		end = vi.fn();
		vi.resetModules();
		vi.clearAllMocks();
	});

	it("returns result if apm is not started", async () => {
		vi.spyOn(apm, "isStarted").mockReturnValue(false);
		class TestNotStartedClass {
			@ElasticTransaction("test-transaction", "custom")
			async testMethod(val: string) {
				if (val === "error") throw new Error("Test error");
				return `Hello ${val}`;
			}
		}
		const notStartedInstance = new TestNotStartedClass();
		const result = await notStartedInstance.testMethod("world");
		expect(result).toBe("Hello world");
	});

	it("starts a transaction and returns result", async () => {
		vi.spyOn(apm, "isStarted").mockReturnValue(true);
		vi.spyOn(apm, "startTransaction").mockImplementation(
			() =>
				({
					setOutcome,
					addLabels,
					end,
				}) as unknown as Transaction,
		);
		class TestClass {
			@ElasticTransaction("test-transaction", "custom")
			async testMethod(val: string) {
				if (val === "error") throw new Error("Test error");
				return `Hello ${val}`;
			}
		}
		const instance = new TestClass();
		const result = await instance.testMethod("world");
		expect(result).toBe("Hello world");
		expect(apm.startTransaction).toHaveBeenCalledWith(
			"test-transaction",
			"custom",
		);
	});

	it("handles errors and sets transaction outcome", async () => {
		vi.spyOn(apm, "isStarted").mockReturnValue(true);
		vi.spyOn(apm, "startTransaction").mockImplementation(
			() =>
				({
					setOutcome,
					addLabels,
					end,
				}) as unknown as Transaction,
		);
		class TestClass {
			@ElasticTransaction("test-transaction", "custom")
			async testMethod(val: string) {
				if (val === "error") throw new Error("Test error");
				return `Hello ${val}`;
			}
		}
		const instance = new TestClass();
		await expect(instance.testMethod("error")).rejects.toThrow("Test error");
		expect(setOutcome).toHaveBeenCalledWith("failure");
		expect(addLabels).toHaveBeenCalled();
		expect(end).toHaveBeenCalled();
	});

	it("should operate as expected when transaction is null", async () => {
		vi.spyOn(apm, "isStarted").mockReturnValue(true);
		vi.spyOn(apm, "startTransaction").mockReturnValue(null as never);

		class TestClass {
			@ElasticTransaction("test-transaction", "custom")
			async testMethod(val: string) {
				if (val === "error") throw new Error("Test error");
				return `Hello ${val}`;
			}
		}

		const instance = new TestClass();
		const result = await instance.testMethod("world");
		expect(result).toBe("Hello world");
	});
});
