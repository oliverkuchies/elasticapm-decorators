import apm, { type Span } from "elastic-apm-node";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { ElasticSpan } from "./span";

vi.spyOn(apm, "isStarted").mockReturnValue(false);
vi.spyOn(apm, "startSpan").mockReturnValue({
	name: "mock-span",
	type: "custom",
	subtype: "sub",
	setOutcome: vi.fn(),
	addLabels: vi.fn(),
	end: vi.fn(),
} as unknown as Span);

class TestNotStartedClass {
	@ElasticSpan("test-span", "custom", "sub")
	async testMethod(val: string) {
		if (val === "error") throw new Error("Test error");
		return `Hello ${val}`;
	}

	@ElasticSpan("multi-param-span", "custom", "sub")
	processOrder(
		orderId: string,
		customer: { id: string; name: string },
		items: Array<{ sku: string; quantity: number }>,
		options: { express: boolean; notes?: string },
	) {
		return {
			orderId,
			customer,
			items,
			options,
		};
	}
}

vi.spyOn(apm, "isStarted").mockReturnValue(true);
class TestClass {
	@ElasticSpan("test-span", "custom", "sub")
	async testMethod(val: string) {
		if (val === "error") throw new Error("Test error");
		return `Hello ${val}`;
	}

	@ElasticSpan("multi-param-span", "custom", "sub")
	processOrder(
		orderId: string,
		customer: { id: string; name: string },
		items: Array<{ sku: string; quantity: number }>,
		options: { express: boolean; notes?: string },
	) {
		return {
			orderId,
			customer,
			items,
			options,
		};
	}
}

describe("ElasticSpan", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(apm, "isStarted").mockReturnValue(true);
		vi.spyOn(apm, "startSpan").mockImplementation(
			() =>
				({
					setOutcome: vi.fn(),
					addLabels: vi.fn(),
					end: vi.fn(),
				}) as unknown as Span,
		);
	});
	it("should skip span logic if apm is not started", async () => {
		const instance = new TestNotStartedClass();
		const result = await instance.testMethod("world");
		expect(result).toBe("Hello world");
	});

	it("starts a span and returns result", async () => {
		const setOutcome = vi.fn();
		const addLabels = vi.fn();
		const end = vi.fn();
		(apm.startSpan as Mock).mockReturnValue({
			setOutcome,
			addLabels,
			end,
		});

		const instance = new TestClass();
		const result = await instance.testMethod("world");
		expect(result).toBe("Hello world");
		expect(apm.startSpan).toHaveBeenCalledWith("test-span", "custom", "sub");
		expect(setOutcome).toHaveBeenCalledWith("success");
		expect(addLabels).toHaveBeenCalled();
		expect(end).toHaveBeenCalled();
	});

	it("handles errors and sets span outcome", async () => {
		const setOutcome = vi.fn();
		const addLabels = vi.fn();
		const end = vi.fn();
		(apm.startSpan as Mock).mockReturnValue({
			setOutcome,
			addLabels,
			end,
		});

		const instance = new TestClass();
		await expect(instance.testMethod("error")).rejects.toThrow("Test error");
		expect(setOutcome).toHaveBeenCalledWith("failure");
		expect(addLabels).toHaveBeenCalled();
		expect(end).toHaveBeenCalled();
	});

	it("if span is null, proceeds without span operations", async () => {
		(apm.startSpan as Mock).mockReturnValue(null);

		const instance = new TestClass();
		const result = await instance.testMethod("world");
		expect(result).toBe("Hello world");
	});

	it("handles methods with multiple parameters", async () => {
		const instance = new TestClass();
		const orderId = "ORDER-123";
		const customer = { id: "CUST-1", name: "Alice" };
		const items = [
			{ sku: "SKU-001", quantity: 2 },
			{ sku: "SKU-002", quantity: 1 },
		];
		const options = { express: true, notes: "Leave at door" };

		const result = await instance.processOrder(
			orderId,
			customer,
			items,
			options,
		);
		expect(result).toEqual({
			orderId,
			customer,
			items,
			options,
		});
	});
});
