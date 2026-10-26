/**
 * Initialize and register all job providers
 */

import { providerRegistry } from './provider-registry'
import { JSearchProvider } from './jsearch-provider'
import { FixtureProvider } from './fixture-provider'

let initialized = false

export function initializeProviders(): void {
  if (initialized) return

  providerRegistry.register(new JSearchProvider())
  providerRegistry.register(new FixtureProvider())

  initialized = true
}

export { providerRegistry } from './provider-registry'
