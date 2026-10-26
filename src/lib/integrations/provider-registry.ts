/**
 * Job Provider Registry
 * 
 * Manages available job data providers and selects the best one based on configuration.
 */

import type { JobProvider, JobProviderConfig } from '@/lib/types/job'

class ProviderRegistry {
  private providers = new Map<string, JobProvider>()

  register(provider: JobProvider): void {
    this.providers.set(provider.name, provider)
  }

  get(name: string): JobProvider | undefined {
    return this.providers.get(name)
  }

  getAll(): JobProvider[] {
    return Array.from(this.providers.values())
  }

  getConfigured(): JobProvider[] {
    return this.getAll().filter(p => p.isConfigured())
  }

  /**
   * Returns the best available provider.
   * Priority: configured API providers > fixture provider
   */
  getBestAvailable(): JobProvider | undefined {
    const configured = this.getConfigured()
    
    // Prefer real API providers over fixtures
    const apiProvider = configured.find(p => p.type === 'api')
    if (apiProvider) return apiProvider

    const feedProvider = configured.find(p => p.type === 'feed')
    if (feedProvider) return feedProvider

    // Fall back to fixture
    const fixtureProvider = configured.find(p => p.type === 'fixture')
    return fixtureProvider
  }

  getStatus(): Array<JobProviderConfig & { isDefault: boolean }> {
    const best = this.getBestAvailable()
    return this.getAll().map(p => ({
      ...p.getConfig(),
      isDefault: p.name === best?.name,
    }))
  }
}

export const providerRegistry = new ProviderRegistry()
