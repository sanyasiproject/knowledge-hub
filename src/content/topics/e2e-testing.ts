import type { TopicContent } from "../types";

export const e2eTesting: TopicContent = {
  quickSummary: [
    "End-to-end (E2E) tests verify the entire application from the user's perspective, exercising the full stack -- browser, frontend, API, database, and external services -- to confirm critical user workflows function correctly.",
    "Modern E2E frameworks like Playwright (Microsoft), Cypress (open source), and Selenium (W3C standard) automate browser interactions including clicks, form fills, navigation, and assertions on page content.",
    "E2E tests sit at the top of the test pyramid: fewest in number but highest in confidence. They are slow, expensive to maintain, and prone to flakiness, so they should cover only critical business paths.",
    "The Page Object Model (POM) design pattern encapsulates page-specific selectors and interactions into reusable classes, making E2E tests more readable and resilient to UI changes.",
  ],
  detailed: [
    "E2E tests simulate real user behavior: navigating to a page, filling out forms, clicking buttons, and verifying outcomes. Unlike unit and integration tests, which test components in isolation or partial assemblies, E2E tests exercise the complete system including the browser rendering engine, JavaScript execution, network requests, server-side processing, and database persistence. This provides the highest confidence that the system works as users experience it, but at significant cost in speed, complexity, and maintenance.",
    "Playwright, developed by Microsoft, supports Chromium, Firefox, and WebKit with a single API. It provides auto-waiting (automatically waits for elements to be actionable before interacting), built-in assertions with retry logic, network interception, and parallel execution across browsers. Cypress takes a different architectural approach by running inside the browser itself, giving it access to the application's JavaScript context. Selenium is the oldest framework, implementing the W3C WebDriver protocol, and supports the widest range of browsers and programming languages.",
    "The Page Object Model (POM) separates test logic from page structure. Each page or component of the application gets a class that exposes high-level methods (login, addToCart, checkout) and encapsulates selectors. When the UI changes, only the page object needs updating, not every test that interacts with that page. This dramatically reduces maintenance burden. More modern patterns like the Screenplay Pattern take this further by modeling actors, abilities, tasks, and questions for even greater reusability.",
    "Test flakiness is the single biggest challenge in E2E testing. Flaky tests fail intermittently due to timing issues, animation delays, network variability, or state leakage between tests. Strategies to combat flakiness include: using auto-waiting mechanisms (Playwright's built-in, Cypress's automatic retry), avoiding hard-coded waits (sleep), using data-testid attributes for stable selectors instead of CSS classes or XPath, resetting application state before each test, and running tests with retry on failure in CI (while tracking and fixing root causes).",
    "Visual regression testing captures screenshots of pages or components and compares them against baseline images to detect unintended visual changes. Tools like Percy (BrowserStack), Chromatic (Storybook), and Playwright's built-in toHaveScreenshot() detect pixel-level differences. This catches CSS regressions, layout shifts, and styling bugs that functional tests miss. Visual tests require careful management of baselines, viewport sizes, and platform-specific rendering differences.",
    "CI integration for E2E tests requires headless browser execution, containerized environments, and intelligent test selection. Docker images with pre-installed browsers (Playwright's mcr.microsoft.com/playwright, Cypress's cypress/included) simplify CI setup. Running the full E2E suite on every commit is often too slow; strategies include running a smoke subset on every PR and the full suite on merges to main, or using test impact analysis to run only tests affected by changed code.",
  ],
  deepDive: [
    "Playwright's architecture differs fundamentally from Selenium's. Selenium sends commands over the WebDriver protocol (HTTP-based) to a browser-specific driver process that translates them into browser actions. This introduces latency and limits the types of interactions possible. Playwright communicates directly with browsers via the Chrome DevTools Protocol (CDP) for Chromium, a similar protocol for Firefox, and a WebKit-specific protocol. This direct communication enables features impossible with WebDriver: intercepting network requests, mocking API responses, emulating geolocation and permissions, and capturing code coverage. Playwright also supports multiple browser contexts (independent sessions) within a single browser instance, enabling parallel test execution without the overhead of launching separate browser processes.",
    "The tradeoff between E2E and lower-level tests follows a cost curve. An E2E test for a checkout flow might take 30 seconds, require a running frontend, backend, database, and payment service, and break when any of those components change. The same confidence in the payment logic could be achieved with a few unit tests (validating discount calculation), an integration test (verifying order persistence), and a contract test (ensuring API compatibility with the payment service) -- all running in under 1 second combined. E2E tests should cover what lower-level tests cannot: the assembly of all components, browser-specific rendering, JavaScript execution, and the full user workflow including navigation and state transitions.",
    "Test data management for E2E tests is more complex than for lower levels. Options include: API-based seeding (call backend APIs to create test data before each test), database seeding (directly insert test data, requires DB access from the test runner), shared test accounts (pre-configured data in a staging environment, risks state leakage), and snapshot/restore (restore a database snapshot before each test run). The best approach depends on test isolation requirements, execution speed, and infrastructure constraints. Playwright's fixtures system and Cypress's cy.task() provide hooks for custom setup/teardown logic.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Playwright E2E test with Page Object Model",
      source: `// pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}

// pages/DashboardPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  private readonly welcomeText: Locator;
  private readonly logoutButton: Locator;

  constructor(private page: Page) {
    this.welcomeText = page.getByTestId('welcome-message');
    this.logoutButton = page.getByRole('button', { name: 'Log Out' });
  }

  async expectWelcome(name: string) {
    await expect(this.welcomeText).toContainText(\`Welcome, \${name}\`);
  }

  async logout() {
    await this.logoutButton.click();
  }
}

// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await loginPage.login('alice@example.com', 'validPassword123');

    const dashboard = new DashboardPage(page);
    await dashboard.expectWelcome('Alice');
    await expect(page).toHaveURL('/dashboard');
  });

  test('invalid credentials show error message', async ({ page }) => {
    await loginPage.login('alice@example.com', 'wrongPassword');
    await loginPage.expectError('Invalid email or password');
    await expect(page).toHaveURL('/login');
  });

  test('empty email shows validation error', async ({ page }) => {
    await loginPage.login('', 'somePassword');
    await loginPage.expectError('Email is required');
  });
});`,
    },
    {
      language: "typescript",
      caption: "Playwright test with API mocking and visual regression",
      source: `import { test, expect } from '@playwright/test';

test.describe('Product catalog', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls and return mock data
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Widget', price: 9.99, inStock: true },
          { id: '2', name: 'Gadget', price: 49.99, inStock: false },
          { id: '3', name: 'Doohickey', price: 4.99, inStock: true },
        ]),
      });
    });
  });

  test('displays products from API', async ({ page }) => {
    await page.goto('/products');

    // Wait for products to render
    await expect(page.getByTestId('product-list')).toBeVisible();

    // Verify product cards
    const cards = page.getByTestId('product-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.first()).toContainText('Widget');
    await expect(cards.first()).toContainText('$9.99');
  });

  test('shows out-of-stock badge', async ({ page }) => {
    await page.goto('/products');

    const gadgetCard = page.getByTestId('product-card').filter({
      hasText: 'Gadget',
    });
    await expect(
      gadgetCard.getByTestId('out-of-stock-badge')
    ).toBeVisible();
  });

  test('visual regression: product catalog page', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByTestId('product-list')).toBeVisible();

    // Compare against baseline screenshot
    await expect(page).toHaveScreenshot('product-catalog.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('handles API error gracefully', async ({ page }) => {
    // Override the route with an error response
    await page.route('**/api/products', async (route) => {
      await route.fulfill({ status: 500 });
    });
    await page.goto('/products');

    await expect(page.getByTestId('error-message')).toContainText(
      'Unable to load products'
    );
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });
});`,
    },
    {
      language: "python",
      caption: "Selenium Page Object Model in Python with pytest",
      source: `# pages/search_page.py
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class SearchPage:
    URL = "/search"

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def navigate(self):
        self.driver.get(f"{self.driver.base_url}{self.URL}")
        return self

    def search_for(self, query: str):
        search_input = self.wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='search-input']"))
        )
        search_input.clear()
        search_input.send_keys(query)
        self.driver.find_element(By.CSS_SELECTOR, "[data-testid='search-button']").click()
        return self

    def get_result_count(self) -> int:
        results = self.wait.until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[data-testid='search-result']"))
        )
        return len(results)

    def get_first_result_title(self) -> str:
        first = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='search-result']:first-child h3"))
        )
        return first.text

    def has_no_results_message(self) -> bool:
        return len(self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='no-results']")) > 0


# tests/test_search.py
import pytest
from selenium import webdriver
from pages.search_page import SearchPage

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    d = webdriver.Chrome(options=options)
    d.base_url = "http://localhost:3000"
    yield d
    d.quit()

class TestSearch:
    def test_search_returns_matching_results(self, driver):
        page = SearchPage(driver).navigate()
        page.search_for("widget")
        assert page.get_result_count() > 0
        assert "widget" in page.get_first_result_title().lower()

    def test_empty_search_shows_no_results(self, driver):
        page = SearchPage(driver).navigate()
        page.search_for("xyznonexistent12345")
        assert page.has_no_results_message()`,
    },
  ],
  diagrams: [
    {
      title: "E2E Test Architecture",
      kind: "architecture",
      caption:
        "Shows how the E2E test runner controls a browser that interacts with the deployed application stack (frontend, API, database), with optional API mocking for controlled scenarios.",
    },
    {
      title: "Page Object Model Structure",
      kind: "architecture",
      caption:
        "Illustrates how test files use page objects that encapsulate selectors and actions, decoupling test logic from UI structure so changes to the UI only require updating page objects.",
    },
  ],
  animations: [
    {
      title: "E2E Test Execution Lifecycle",
      steps: [
        {
          label: "Environment setup",
          detail:
            "The CI pipeline starts the application stack (or connects to a staging environment). The test runner launches a browser instance (headless in CI, headed locally for debugging).",
        },
        {
          label: "Test data seeding",
          detail:
            "Before each test, seed the required data via API calls or database fixtures. This ensures each test starts from a known, predictable state.",
        },
        {
          label: "Browser automation",
          detail:
            "The test navigates to pages, fills forms, clicks buttons, and simulates user interactions. The framework auto-waits for elements to be visible and actionable before interacting.",
        },
        {
          label: "Assertions and screenshots",
          detail:
            "The test verifies expected outcomes: page content, URL changes, element visibility. Visual regression tests capture and compare screenshots against baselines.",
        },
        {
          label: "Cleanup and reporting",
          detail:
            "Test data is cleaned up. The runner generates reports with pass/fail status, execution time, screenshots of failures, and optional video recordings for debugging.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "Playwright", "Cypress", "Selenium"],
    rows: [
      [
        "Browser support",
        "Chromium, Firefox, WebKit",
        "Chrome, Firefox, Edge, WebKit (experimental)",
        "All major browsers via WebDriver",
      ],
      [
        "Language support",
        "TypeScript, JavaScript, Python, Java, C#",
        "JavaScript, TypeScript only",
        "Java, Python, C#, Ruby, JavaScript, and more",
      ],
      [
        "Architecture",
        "Direct browser protocol (CDP)",
        "Runs inside the browser",
        "WebDriver protocol (HTTP)",
      ],
      [
        "Auto-waiting",
        "Built-in with configurable timeouts",
        "Built-in, automatic retry",
        "Explicit waits required (WebDriverWait)",
      ],
      [
        "Network interception",
        "Full request/response mocking",
        "cy.intercept() for stubbing and spying",
        "Limited (proxy-based)",
      ],
      [
        "Parallel execution",
        "Built-in with worker processes",
        "Via Cypress Cloud (paid) or third-party",
        "Via Selenium Grid",
      ],
      [
        "iframe/shadow DOM",
        "Native support",
        "Limited shadow DOM support",
        "switchTo().frame() for iframes",
      ],
      [
        "Multi-tab/window",
        "Full multi-context support",
        "Not supported natively",
        "Window handle switching",
      ],
    ],
  },
  interviewQA: [
    {
      q: "When should you use E2E tests vs unit/integration tests?",
      a: "E2E tests should cover critical user workflows that span the entire stack and cannot be fully validated by lower-level tests: login flows, checkout processes, multi-step wizards, and cross-page navigation. They verify that the assembly of all components works correctly from the user's perspective. Unit and integration tests should handle individual logic, data transformations, and component interactions. A common ratio is 70% unit, 20% integration, 10% E2E. Use E2E for the happy paths and highest-risk scenarios, not for exhaustive edge case coverage.",
      followUps: [
        "What is the cost of maintaining too many E2E tests?",
        "Can you test error scenarios end-to-end?",
        "How do you decide which user flows deserve E2E coverage?",
      ],
    },
    {
      q: "What is the Page Object Model and why is it important?",
      a: "The Page Object Model (POM) encapsulates page-specific selectors, locators, and interactions into dedicated classes. Each page or significant component gets a class with methods like login(), addToCart(), checkout(). Tests call these high-level methods instead of interacting with raw selectors. When the UI changes (a button moves, a selector changes), only the page object needs updating, not every test. This reduces maintenance cost dramatically -- without POM, a single CSS class rename could break dozens of tests.",
      followUps: [
        "How does POM differ from the Screenplay Pattern?",
        "Should page objects contain assertions?",
        "How do you handle shared components that appear on multiple pages?",
      ],
    },
    {
      q: "How do you handle flaky E2E tests?",
      a: "First, identify the root cause. Common causes include: race conditions (element not ready when the test interacts with it), animation interference, test data leakage between tests, inconsistent backend state, and network timing variability. Solutions include: using auto-waiting frameworks (Playwright, Cypress), avoiding sleep/hardcoded waits, using data-testid attributes for stable selectors, isolating test data per test, mocking unreliable external services, and running tests with retry in CI while tracking flakiness rates. Never just add retries without investigating the cause -- retries mask problems.",
      followUps: [
        "How do you track flakiness rates across CI builds?",
        "What is test quarantining?",
        "Should you retry failed E2E tests automatically?",
      ],
    },
    {
      q: "What is visual regression testing and when should you use it?",
      a: "Visual regression testing captures screenshots of pages or components and compares them pixel-by-pixel against approved baselines. It detects CSS regressions, layout shifts, font rendering changes, and styling bugs that functional tests miss entirely. Use it for design-critical pages (landing pages, dashboards), component libraries, and after CSS refactoring. Challenges include handling dynamic content (dates, user data -- use consistent test data or mask regions), cross-platform rendering differences (run on a single platform in CI), and managing baseline updates when intentional design changes are made.",
      followUps: [
        "How do you handle dynamic content in visual tests?",
        "What tools support visual regression testing?",
        "How do you manage baseline screenshots across branches?",
      ],
    },
    {
      q: "Compare Playwright and Cypress for E2E testing.",
      a: "Playwright supports multiple browsers (Chromium, Firefox, WebKit) with full multi-tab, multi-context, and iframe support. It uses direct browser protocols for lower latency and supports multiple languages (TypeScript, Python, Java, C#). Cypress runs inside the browser, giving it access to the application's JavaScript context but limiting it to single-tab scenarios. Cypress has a gentler learning curve and excellent developer experience with its test runner GUI. Choose Playwright for cross-browser testing, multi-tab scenarios, or non-JavaScript teams. Choose Cypress for JavaScript-only teams who value developer experience and have simpler testing needs.",
      followUps: [
        "What are the limitations of Cypress's in-browser architecture?",
        "How does Playwright's auto-waiting compare to Cypress's retry-ability?",
        "Can you use both frameworks in the same project?",
      ],
    },
    {
      q: "How do you integrate E2E tests into a CI/CD pipeline?",
      a: "Run E2E tests in headless mode inside Docker containers with pre-installed browsers (Playwright and Cypress provide official Docker images). Deploy the application to a temporary environment or use docker-compose to spin up the full stack. Run a critical smoke subset on every PR to catch regressions quickly, and the full suite on merges to the main branch. Configure test parallelism to reduce total execution time. Store failure artifacts (screenshots, videos, traces) as CI artifacts for debugging. Set up flakiness tracking to identify and fix unreliable tests. Consider using test impact analysis to run only tests affected by changed code.",
      followUps: [
        "How do you reduce E2E test execution time in CI?",
        "What is the difference between smoke tests and full E2E suites?",
        "How do you manage test environments for E2E in CI?",
      ],
    },
  ],
  followUps: [
    "How do you test responsive design across different viewport sizes in E2E tests?",
    "What is the Screenplay Pattern and how does it improve on Page Objects?",
    "How do you handle authentication in E2E tests without logging in through the UI every time?",
    "What strategies exist for E2E testing single-page applications with client-side routing?",
    "How do you manage E2E test data in shared staging environments?",
    "When should you mock APIs in E2E tests vs use real backends?",
  ],
  mcqs: [
    {
      q: "What is the main advantage of the Page Object Model pattern?",
      options: [
        "It makes tests run faster",
        "It isolates UI structure changes to page object classes, not test files",
        "It eliminates the need for assertions",
        "It allows tests to run in parallel",
      ],
      answerIndex: 1,
      explanation:
        "POM encapsulates selectors and page interactions in dedicated classes. When the UI changes, only the page object needs updating, not every test that uses that page.",
    },
    {
      q: "Which E2E framework runs test code inside the browser itself?",
      options: ["Playwright", "Selenium", "Cypress", "Puppeteer"],
      answerIndex: 2,
      explanation:
        "Cypress runs inside the browser alongside the application, giving it direct access to the DOM and application state. Playwright and Selenium control the browser from outside.",
    },
    {
      q: "What is the most common cause of flaky E2E tests?",
      options: [
        "Incorrect assertions",
        "Race conditions where tests interact with elements before they are ready",
        "Using the wrong browser",
        "Having too few tests",
      ],
      answerIndex: 1,
      explanation:
        "Timing issues are the primary cause of flaky E2E tests. Elements may not be rendered, enabled, or visible when the test tries to interact with them, causing intermittent failures.",
    },
    {
      q: "What does visual regression testing detect that functional E2E tests do not?",
      options: [
        "JavaScript errors",
        "Broken API endpoints",
        "CSS regressions, layout shifts, and styling bugs",
        "Database inconsistencies",
      ],
      answerIndex: 2,
      explanation:
        "Visual regression testing compares screenshots to detect pixel-level changes in appearance. Functional tests verify behavior (click this, see that text) but miss visual issues like misaligned elements or wrong colors.",
    },
    {
      q: "Why should E2E tests use data-testid attributes instead of CSS classes for selectors?",
      options: [
        "data-testid attributes load faster",
        "CSS classes change frequently for styling reasons, breaking tests; test IDs are stable",
        "data-testid is required by all E2E frameworks",
        "CSS selectors are not supported in headless mode",
      ],
      answerIndex: 1,
      explanation:
        "CSS classes serve styling purposes and change during design updates. data-testid attributes are added specifically for testing and remain stable across visual redesigns, preventing selector-related flakiness.",
    },
    {
      q: "In the test pyramid, what percentage of tests should be E2E?",
      options: [
        "50-60% -- they provide the most confidence",
        "30-40% -- a balanced approach",
        "5-10% -- only critical user workflows",
        "0% -- E2E tests are not worth the cost",
      ],
      answerIndex: 2,
      explanation:
        "The test pyramid recommends 5-10% E2E tests covering critical paths. They are the most expensive to write, maintain, and run, so they should be reserved for high-value scenarios.",
    },
  ],
  exercises: [
    "Using Playwright or Cypress, write E2E tests for a login flow covering: successful login with redirect to dashboard, failed login with error message, form validation for empty fields, and session persistence (refresh page after login and verify still logged in).",
    "Implement the Page Object Model for a three-page checkout flow (cart, shipping, payment). Write page objects for each step and a test that verifies the complete checkout process. Refactor any duplicate selectors into shared component objects.",
    "Set up visual regression testing for a product listing page. Write tests that capture screenshots at mobile, tablet, and desktop viewports. Handle dynamic content (prices, timestamps) by mocking API responses with consistent data.",
    "Write an E2E test that verifies error handling: mock the API to return 500 errors and verify the application shows a user-friendly error message with a retry button. Then mock the retry to succeed and verify recovery.",
  ],
  flashcards: [
    {
      front: "What is the Page Object Model (POM)?",
      back: "A design pattern that encapsulates page-specific selectors and interactions into reusable classes. Tests call high-level methods (login, checkout) instead of raw selectors, so UI changes only require updating the page object.",
    },
    {
      front: "What makes Playwright different from Selenium architecturally?",
      back: "Playwright communicates directly with browsers via native protocols (CDP for Chromium). Selenium uses the WebDriver HTTP protocol with a driver process intermediary, which adds latency and limits capabilities.",
    },
    {
      front: "What is visual regression testing?",
      back: "Comparing screenshots of pages/components against approved baselines to detect pixel-level visual changes like CSS regressions, layout shifts, and styling bugs that functional tests miss.",
    },
    {
      front: "Why are E2E tests at the top of the test pyramid?",
      back: "They provide the highest confidence but are the slowest, most expensive, and most flaky. The pyramid recommends having very few E2E tests covering only critical user workflows.",
    },
    {
      front: "What is the best selector strategy for E2E tests?",
      back: "Use data-testid attributes. They are added specifically for testing and remain stable across visual redesigns, unlike CSS classes (which change for styling) or XPath (which is brittle to DOM changes).",
    },
    {
      front: "How does Cypress differ from Playwright in architecture?",
      back: "Cypress runs inside the browser alongside the application, giving direct DOM access but limiting it to single-tab scenarios. Playwright controls the browser externally, supporting multi-tab, multi-context, and cross-browser testing.",
    },
  ],
  revisionNotes: [
    "E2E tests verify the entire application stack from the user's perspective. They should cover only critical business workflows -- login, checkout, key CRUD operations.",
    "The Page Object Model encapsulates selectors and page interactions. Tests call page.login(), not page.find('#email'). UI changes update page objects, not tests.",
    "Use data-testid attributes for stable selectors. Avoid CSS classes (change for styling), XPath (brittle to DOM changes), and text content (changes with i18n).",
    "Flaky tests are usually caused by race conditions. Use auto-waiting (Playwright, Cypress), not sleep(). Investigate and fix root causes instead of just adding retries.",
    "Visual regression testing catches CSS bugs, layout shifts, and styling regressions that functional tests miss. Mock API responses for consistent screenshots.",
    "In CI: run headless in Docker, use a smoke subset on PRs, full suite on main merges. Store failure screenshots/videos as artifacts for debugging.",
    "Playwright supports Chromium/Firefox/WebKit with multi-tab and network interception. Cypress runs in-browser with simpler DX but limited browser support and no multi-tab.",
  ],
  cheatSheet: [
    "Playwright selector priority: getByRole() > getByTestId() > getByText() > CSS selectors",
    "Playwright auto-wait: all actions auto-wait for elements to be actionable (visible, enabled, stable)",
    "Cypress: cy.get('[data-testid=x]'), cy.intercept() for network mocking, cy.task() for backend setup",
    "POM structure: one class per page/component, expose high-level methods, hide selectors as private fields",
    "Visual regression: toHaveScreenshot() in Playwright, percy snapshot in Percy, consistent test data is critical",
    "CI Docker images: mcr.microsoft.com/playwright (Playwright), cypress/included (Cypress)",
    "Avoid hard waits: never use sleep/cy.wait(ms). Use auto-wait, explicit waits, or polling assertions",
    "Test data: seed via API before tests, clean up after. Never depend on pre-existing data in shared environments",
  ],
  resources: [
    {
      label: "Playwright Documentation",
      kind: "docs",
      note: "Official Playwright docs covering installation, selectors, auto-waiting, network interception, visual comparison, and CI configuration.",
    },
    {
      label: "Cypress Documentation",
      kind: "docs",
      note: "Complete Cypress reference including best practices, custom commands, network stubbing, and component testing.",
    },
    {
      label: "End-to-End Testing with Cypress by Waweru Mwaura",
      kind: "book",
      note: "Practical guide to E2E testing with Cypress covering POM, CI integration, and strategies for handling flaky tests.",
    },
    {
      label: "Web Application Testing with Selenium by various (Selenium HQ)",
      kind: "docs",
      note: "Official Selenium documentation covering WebDriver, Grid, and IDE for cross-browser testing.",
    },
    {
      label: "Testing Library Documentation",
      kind: "docs",
      note: "Complements E2E frameworks with user-centric selectors (getByRole, getByText) and best practices for accessible testing.",
    },
  ],
  glossary: [
    {
      term: "End-to-End Test",
      definition:
        "A test that exercises the complete application stack from the user's perspective, including browser, frontend, API, and database.",
    },
    {
      term: "Page Object Model",
      definition:
        "A design pattern that encapsulates page-specific selectors and interactions into reusable classes, decoupling test logic from UI structure.",
    },
    {
      term: "Headless Browser",
      definition:
        "A browser running without a visible UI, used in CI environments for automated testing. All major browsers support headless mode.",
    },
    {
      term: "Visual Regression Testing",
      definition:
        "Comparing screenshots of rendered pages against approved baselines to detect unintended visual changes like CSS regressions and layout shifts.",
    },
    {
      term: "Test Flakiness",
      definition:
        "The property of a test that produces inconsistent results (intermittent pass/fail) without code changes, typically caused by timing issues or state leakage.",
    },
    {
      term: "Auto-waiting",
      definition:
        "A framework feature that automatically waits for elements to be visible, enabled, and stable before interacting with them, reducing timing-related flakiness.",
    },
    {
      term: "Network Interception",
      definition:
        "The ability to intercept, modify, or mock HTTP requests and responses during test execution, enabling controlled test scenarios without a real backend.",
    },
  ],
};
