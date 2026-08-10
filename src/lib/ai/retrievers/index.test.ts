import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getActiveLabRetriever, resolveLabRetrieverMode } from "./index"

const original = process.env.AI_LAB_RETRIEVER

beforeEach(() => {
    delete process.env.AI_LAB_RETRIEVER
})

afterEach(() => {
    process.env.AI_LAB_RETRIEVER = original
})

describe("resolveLabRetrieverMode", () => {
    it("defaults to keyword when unset", () => {
        expect(resolveLabRetrieverMode()).toBe("keyword")
    })

    it("defaults to keyword for an unrecognized value rather than crashing or silently using an experimental retriever", () => {
        process.env.AI_LAB_RETRIEVER = "vector-magic"
        expect(resolveLabRetrieverMode()).toBe("keyword")
    })

    it("honors a valid explicit value", () => {
        process.env.AI_LAB_RETRIEVER = "file-search"
        expect(resolveLabRetrieverMode()).toBe("file-search")
        process.env.AI_LAB_RETRIEVER = "hybrid"
        expect(resolveLabRetrieverMode()).toBe("hybrid")
    })
})

describe("getActiveLabRetriever", () => {
    it("returns the keyword retriever by default (production stays on the stable retriever)", () => {
        expect(getActiveLabRetriever().name).toBe("keyword")
    })

    it("returns the file-search retriever when explicitly configured", () => {
        process.env.AI_LAB_RETRIEVER = "file-search"
        expect(getActiveLabRetriever().name).toBe("file-search")
    })

    it("returns a hybrid retriever when explicitly configured", () => {
        process.env.AI_LAB_RETRIEVER = "hybrid"
        expect(getActiveLabRetriever().name).toBe("hybrid")
    })
})
