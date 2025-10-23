import apm from "elastic-apm-node";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ElasticSpan } from "./span";

class TestClass {
	@ElasticSpan("test-span", "custom", "sub")
	async testMethod(val: string) {
		if (val === "error") throw new Error("Test error");
		return `Hello ${val}`;
	}
}

describe("ElasticSpan", () => {
	let instance: TestClass;

	beforeEach(() => {
		instance = new TestClass();
		vi.clearAllMocks();
	});

	it("returns Hello world if apm is not started", async () => {
		vi.spyOn(apm, "isStarted").mockReturnValue(false);
		const result = await instance.testMethod("world");
		expect(result).toBe("Hello world");
	});

	it("starts a span and returns result", async () => {
		vi.mock("elastic-apm-node", () => ({
			default: {
				isStarted: () => true,
				startSpan: vi.fn(),
			},
		}));

		const startSpan = vi.fn().mockReturnValue({
			setOutcome: vi.fn(),
			addLabels: vi.fn(),
			end: vi.fn(),
		});
		vi.spyOn(apm, "startSpan").mockImplementation(startSpan);
		const result = await instance.testMethod("world");
		expect(result).toBe("Hello world");
		expect(startSpan).toHaveBeenCalledWith("test-span", "custom", "sub");
	});

	it("handles errors and sets span outcome", async () => {
		vi.mock("elastic-apm-node", () => ({
			default: {
				isStarted: () => true,
				startSpan: vi.fn().mockReturnValue({
					setOutcome: vi.fn(),
					addLabels: vi.fn(),
					end: vi.fn(),
				}),
			},
		}));

		await expect(instance.testMethod("error")).rejects.toThrow("Test error");
		expect(apm.startSpan()?.setOutcome).toHaveBeenCalledWith("failure");
		expect(apm.startSpan()?.addLabels).toHaveBeenCalled();
		expect(apm.startSpan()?.end).toHaveBeenCalled();
	});
});
