# Intro

Accessibility testing was briefly mentioned in the "testingCategories" reading for this course, and I have a passion for creating accessible websites that adhere to accessibility standards. Playwright provides some basic libraries of testing for these standards, which give an easy way to implement testing that will check for the various benchmarks. Playwright documentation gives these as an example:

- Text that would be hard to read for users with vision impairments due to poor color contrast with the background behind it
- UI controls and form elements without labels that a screen reader could identify
- Interactive elements with duplicate IDs which can confuse assistive technologies

# Why Accessibility Matters

Website accessibility is important not only to ensure equal access for the non-insignificant number of users on the internet with disabilites affecting their website usage, but also to provide a better UX experience for everyone. It has been studied and proven that when websites are developed to meet high accessibility standards, it improves the user experience for non-disabled ussers. In addition, many types of companies are required by law to meet certain standards for accessibility. Overall, accessibity greatly improves the design of software and websites through a easily measured set of standards. With the rise of AI coding agents, there are even more opportunities to provide a good web experience to disabled users.

# Accessibility Levels

The primary accessbility standard are the [Web Content Accessibility Guidelines](https://www.w3.org/TR/WCAG22/) (WCAG) published by the [World Wide Web Consortium](https://www.w3.org/) (W3C) that measure based on four principles; Perceivable, Operable, Understandable, and Robust. To measure the amount of adherence and coverage of the guidelines, there are three levels of conformance that are provided:

1. Level A (minimum) - basic accessibility features that remove the most significant barriers, but don't guarantee full access
1. Level AA (standard) - industry standard and common legal requirement, covers common barriers for users with disabilities
1. Level AAA (highest) - most comprehensive and strict adherence to guidelines, providing highest level of accessibility

# Playwright Features

Here are the following features that Playwright provides as tools to measure how a website meets accessibility standards. Find the full details [here](https://playwright.dev/docs/accessibility-testing).

| Feature                          | Description                                                                                                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scanning an entire page          | Import @axe-core/playwright package and apply it in a test to scan an entire page for any accessibility violations to be found                                                            |
| Scanning specific part of a page | Use the AxeBuilder class to constrain an accessbility scan to run against a specific portion of a page in its current state                                                               |
| Scan for WCAG violations         | You can constrain a scan to only those ruls tagged for specific WCAG success criteria, such as only (A) or (AA) standards                                                                 |
| Known issue handling             | There are various ways to exclude individual elements, certain standards, or otherwise known issues from a scan so that they can be worked on separately without interrupting the testing |

# My Implementation

### Step 1: Setup

1. Install the testing library in the jwt-pizza directory
   > > npm install --save-dev @axe-core/playwright
1. Verify installation by checking for the @axe-core/playwright package in package.json under devDependencies

### Step 2: Accessibility Test Helpers

Using a coding assitant, I did the following:

1. Created `tests/a11y-helpers.ts` utility file with reusable functions:
   - `scanPageA11y()` - scans entire page for WCAG AA violations
   - `expectNoA11yViolations()` - assertion to fail tests on violations
   - `scanElementA11y()` - scans specific element for violations
   - `logA11yViolations()` - outputs detailed violation reports

2. Implemented using `AxeBuilder` class from `@axe-core/playwright`:
   - `new AxeBuilder({ page })` initializes a scan builder for a Playwright page
   - `.withTags(['wcag2aa'])` filters results to WCAG 2.2 AA level only
   - `.include([selector])` restricts scan to a specific element
   - `.analyze()` executes the scan and returns violations and passes

3. Each function calls `analyze()` to run the scan and extracts violations from results

### Step 3: Set Baseline Coverage

### Step 4: Create Accessibility Test Suite

### Step 5: Violation Discovery & Fixes

### Step 6: CI Integration

# My Learning

# Conclusion

---

## Accessibility Testing Info From Course Instruction

Accessibility testing ensures that your application can service a diverse population of customers. Not only does this help some of the most disadvantaged members of our community, it can also be a violation of local or federal law to not adhere to the most basic levels of accessibility support. This includes high contrast themes, support for screen readers, and proper keyboard navigation.

The most popular accessibility guideline in North America is the Web Content Accessibility Guidelines (WCAG). Not only does this guideline provide 12 comprehensive guidelines organized under the categories of Perceivable, Operable, Understandable, and Robust, it also provides a full test suite that you can apply to your application.

You can also test your accessibility using Google Chrome's Lighthouse utility. Open up JWT Pizza in Chrome and access the `Lighthouse` tab in the developer tools. Make sure you have **Accessibility** checked and press the `Analyze page load` button.

> > image

After a brief moment it will report a score for your home page. It looks like JWT Pizza is doing alright with a score of 82, but there are a couple of simple things that can be done to easily bump it up to a perfect 100.

> > image

💡 Accessibility testing in an emerging and interesting area to invest your time in. Perhaps you should consider researching this for your curiosity project.
