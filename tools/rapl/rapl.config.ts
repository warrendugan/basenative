/**
 * RAPL Loop Configuration
 * Red → Amber → Pact → Live
 *
 * A deployment gate pattern ensuring reliability and preventing broken deployments:
 *
 * 🔴 RED:
 *   - Unit tests must pass (nx affected --target=test)
 *   - Linting must pass (nx affected --target=lint)
 *   - TypeScript must compile without errors
 *   - Fast feedback loop on code quality
 *
 * 🟠 AMBER:
 *   - Integration tests with MSW mocks (simulated API)
 *   - Tests run against mock data, not real backends
 *   - Validates business logic in isolation
 *   - Tests Angular components with realistic API responses
 *
 * 📋 PACT:
 *   - Contract verification against provider (greenput-api)
 *   - Consumer publishes contracts, provider verifies them
 *   - Prevents breaking changes at API boundary
 *   - Ensures both sides of the API contract are in sync
 *
 * 🟢 LIVE:
 *   - Deploy to preview environment
 *   - Run E2E tests with Playwright on real deployment
 *   - Validates the full system end-to-end
 *   - Smoke tests on preview before deploying to production
 *
 * Each stage must pass before progressing to the next.
 * Enforced via GitHub Actions workflow in .github/workflows/rapl-pipeline.yml
 *
 * Example flow:
 * 1. Developer pushes to branch
 * 2. CI runs RED stage → if fails, stop here
 * 3. CI runs AMBER stage → if fails, stop here
 * 4. CI runs PACT stage → if fails, stop here
 * 5. CI runs LIVE stage → if fails, stop here
 * 6. If all pass on main branch → auto-deploy to production
 */

export const RAPL_STAGES = {
  red: {
    name: 'RED - Unit Tests & Lint',
    description: 'Fast unit tests and code quality checks',
    timeout: 10 * 60, // 10 minutes
    commands: [
      'nx affected --target=lint --exclude="*-e2e"',
      'nx affected --target=test --exclude="*-e2e"',
    ],
  },
  amber: {
    name: 'AMBER - Integration Tests (MSW)',
    description: 'Integration tests with mocked API',
    timeout: 15 * 60, // 15 minutes
    commands: [
      'nx run tools-msw:test', // Test MSW handlers
      'nx affected --target=integration-test', // App integration tests
    ],
  },
  pact: {
    name: 'PACT - Contract Verification',
    description: 'Consumer publishes contracts, provider verifies',
    timeout: 20 * 60, // 20 minutes
    commands: [
      'nx run tools-pact:test', // Consumer publishes contracts
      'npm run pact:verify', // Provider verifies contracts
    ],
  },
  live: {
    name: 'LIVE - E2E & Preview Deployment',
    description: 'Deploy to preview and run E2E tests',
    timeout: 30 * 60, // 30 minutes
    commands: [
      'nx run showcase:build:production', // Build all apps
      'nx run greenput:build:production',
      'npm run deploy:preview', // Deploy to Cloudflare Pages preview
      'nx run showcase-e2e:e2e', // Run Playwright E2E tests
    ],
  },
} as const;

export type RAPLStage = keyof typeof RAPL_STAGES;

/**
 * Validation rules for each stage
 */
export const RAPL_RULES = {
  red: {
    required: true,
    blocksDeploy: true,
    runOnBranch: 'always',
  },
  amber: {
    required: true,
    blocksDeploy: true,
    runOnBranch: 'always',
  },
  pact: {
    required: true,
    blocksDeploy: true,
    runOnBranch: 'always',
  },
  live: {
    required: true,
    blocksDeploy: true,
    runOnBranch: 'main', // Only on main branch after all other stages pass
  },
} as const;
