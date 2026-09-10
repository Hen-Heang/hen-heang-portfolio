import { expect, type Locator } from "@playwright/test"

/**
 * Fill a React-controlled input and confirm the typed value survived.
 *
 * Playwright can win the race against hydration on a server-rendered page: it
 * sets the value while React has no listener attached, hydration then resets
 * the controlled input to its initial value, and the text — along with the
 * filtering it should have triggered — is discarded with no error. The input
 * simply reads empty and every later assertion fails with "element(s) not
 * found". Re-filling once React is listening is enough, so retry until the
 * value sticks: for a controlled input, a value that stays put is proof React
 * processed the change.
 */
export async function fillControlled(input: Locator, value: string) {
    await expect(async () => {
        await input.fill(value)
        await expect(input).toHaveValue(value, { timeout: 1_000 })
    }).toPass({ timeout: 15_000 })
}
