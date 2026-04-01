import { Page, expect } from "@playwright/test";
import { injectAxe, checkA11y, getViolations } from "@axe-core/playwright";

/**
 * Scans a page for WCAG 2.2 AA accessibility violations
 * @param page - Playwright page instance
 * @param options - Optional configuration for the scan
 */
export async function scanPageA11y(
  page: Page,
  options?: {
    exclude?: string[];
    include?: string[];
    rules?: Record<string, boolean>;
  },
) {
  await injectAxe(page);

  const violations = await getViolations(page, {
    standards: "wcag2aa",
    rules: options?.rules,
    exclude: options?.exclude,
    include: options?.include,
  });

  return violations;
}

/**
 * Asserts that a page has no WCAG 2.2 AA violations
 * @param page - Playwright page instance
 * @param options - Optional configuration for the scan
 */
export async function expectNoA11yViolations(
  page: Page,
  options?: {
    exclude?: string[];
    include?: string[];
    rules?: Record<string, boolean>;
  },
) {
  await injectAxe(page);

  await checkA11y(page, null, {
    standards: "wcag2aa",
    rules: options?.rules,
    exclude: options?.exclude,
    include: options?.include,
  });
}

/**
 * Scans a specific element for WCAG 2.2 AA violations
 * @param page - Playwright page instance
 * @param selector - CSS selector of the element to scan
 */
export async function scanElementA11y(page: Page, selector: string) {
  await injectAxe(page);

  const violations = await getViolations(page, {
    standards: "wcag2aa",
    include: [selector],
  });

  return violations;
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
