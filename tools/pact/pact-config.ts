/**
 * Pact.io Configuration
 * Consumer-Driven Contract Testing for GreenPut.
 *
 * The greenput app is a "consumer" of the greenput-api "provider".
 * Contracts are verified on every PR to prevent breaking changes at the API boundary.
 *
 * Workflow:
 * 1. Consumer (greenput) defines interactions
 * 2. Consumer runs tests and publishes contracts to the Pact Broker
 * 3. Provider (greenput-api) verifies it can fulfill all contracts
 * 4. Before deploy, verify both consumer and provider are in sync
 *
 * This prevents accidental breaking API changes and ensures contracts are explicit.
 */
export const PACT_CONFIG = {
  consumer: {
    greenput: {
      name: 'greenput-ui',
      port: 4300,
    },
  },
  provider: {
    name: 'greenput-api',
    url: 'http://localhost:8787', // wrangler dev port
  },
  pactBrokerUrl:
    process.env['PACT_BROKER_URL'] ?? 'http://localhost:9292',
  publishVerificationResult: process.env['CI'] === 'true',
} as const;
