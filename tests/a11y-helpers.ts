import { expect, Page, TestInfo } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

type A11yNode = {
  html?: string;
  target?: string[];
  failureSummary?: string;
};

type A11yViolation = {
  id: string;
  impact?: string;
  description?: string;
  helpUrl?: string;
  nodes: A11yNode[];
};

/**
 * Scans a page for WCAG 2.2 AA accessibility violations
 * @param page - Playwright page instance
 */
export async function scanPageA11y(page: Page): Promise<A11yViolation[]> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2aa"])
    .analyze();

  return results.violations;
}

/**
 * Asserts that a page has no WCAG 2.2 AA violations
 * @param page - Playwright page instance
 */
export async function expectNoA11yViolations(
  page: Page,
  testInfo: TestInfo,
  pageName: string,
) {
  const violations = await scanPageA11y(page);
  await attachA11yArtifacts(testInfo, pageName, violations);
  logA11yViolations(violations);
  expect(
    violations,
    `Accessibility violations found on ${pageName}. See attached a11y-summary and a11y-violations artifacts in the HTML report.`,
  ).toHaveLength(0);
}

/**
 * Scans a specific element for WCAG 2.2 AA violations
 * @param page - Playwright page instance
 * @param selector - CSS selector of the element to scan
 */
export async function scanElementA11y(
  page: Page,
  selector: string,
): Promise<A11yViolation[]> {
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
export function logA11yViolations(violations: A11yViolation[]): void {
  if (violations.length === 0) {
    console.log("✅ No accessibility violations found");
    return;
  }

  console.log(`\n⚠️  Found ${violations.length} accessibility violation(s):\n`);

  violations.forEach((violation, index) => {
    console.log(`${index + 1}. ${violation.id} (Impact: ${violation.impact})`);
    console.log(`   Description: ${violation.description}`);
    console.log(`   Affected nodes: ${violation.nodes.length}`);
    violation.nodes.forEach((node: A11yNode) => {
      console.log(`   - ${node.html}`);
    });
    console.log("");
  });
}

export function formatA11yViolations(
  pageName: string,
  violations: A11yViolation[],
): string {
  if (violations.length === 0) {
    return `Page: ${pageName}\nNo accessibility violations found.`;
  }

  const lines: string[] = [
    `Page: ${pageName}`,
    `Violation groups: ${violations.length}`,
    "",
  ];

  violations.forEach((violation, index) => {
    lines.push(
      `${index + 1}. ${violation.id} (impact: ${violation.impact ?? "unknown"})`,
    );
    lines.push(`   ${violation.description ?? "No description"}`);
    if (violation.helpUrl) {
      lines.push(`   ${violation.helpUrl}`);
    }
    lines.push(`   affected nodes: ${violation.nodes.length}`);

    violation.nodes.forEach((node) => {
      const targets = node.target?.join(", ") ?? "unknown target";
      lines.push(`   - target: ${targets}`);
      if (node.failureSummary) {
        lines.push(
          `     summary: ${node.failureSummary.replace(/\s+/g, " ").trim()}`,
        );
      }
    });

    lines.push("");
  });

  return lines.join("\n");
}

async function attachA11yArtifacts(
  testInfo: TestInfo,
  pageName: string,
  violations: A11yViolation[],
) {
  const summary = formatA11yViolations(pageName, violations);

  await testInfo.attach("a11y-summary", {
    body: summary,
    contentType: "text/plain",
  });

  await testInfo.attach("a11y-violations", {
    body: JSON.stringify(violations, null, 2),
    contentType: "application/json",
  });
}
