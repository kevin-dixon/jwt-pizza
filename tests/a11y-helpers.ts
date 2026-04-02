import { Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

/**
 * Scans a page for WCAG 2.2 AA accessibility violations
 * @param page - Playwright page instance
 */
export async function scanPageA11y(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2aa"])
    .analyze();

  return results.violations;
}

/**
 * Asserts that a page has no WCAG 2.2 AA violations
 * @param page - Playwright page instance
 */
export async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2aa"])
    .analyze();

  if (results.violations.length > 0) {
    logA11yViolations(results.violations);
    throw new Error(
      `Found ${results.violations.length} accessibility violation(s)`,
    );
  }
}

/**
 * Scans a specific element for WCAG 2.2 AA violations
 * @param page - Playwright page instance
 * @param selector - CSS selector of the element to scan
 */
export async function scanElementA11y(page: Page, selector: string) {
  const results = await new AxeBuilder({ page })
    .include([selector])
    .withTags(["wcag2aa"])
    .analyze();

  return results.violations;
}

/**
 * Logs detailed accessibility violations for debugging
 * @param violations - Array of violations from scan
 */
export function logA11yViolations(violations: any[]): void {
  if (violations.length === 0) {
    console.log("✅ No accessibility violations found");
    return;
  }

  console.log(`\n⚠️  Found ${violations.length} accessibility violation(s):\n`);

  violations.forEach((violation, index) => {
    console.log(`${index + 1}. ${violation.id} (Impact: ${violation.impact})`);
    console.log(`   Description: ${violation.description}`);
    console.log(`   Affected nodes: ${violation.nodes.length}`);
    violation.nodes.forEach((node: any) => {
      console.log(`   - ${node.html}`);
    });
    console.log("");
  });
}
