/*
 * @microeinhundert/radonis-hooks
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HydrationManager, useHydration } from '@microeinhundert/radonis-hydrate'
import type { RouteIdentifier } from '@microeinhundert/radonis-types'

import { useManifest } from './useManifest'

/**
 * Hook for retrieving info about the current route
 * @see https://radonis.vercel.app/docs/hooks/use-route
 */
export function useRoute() {
  const { route, routes } = useManifest()
  const hydration = useHydration()

  function isCurrent(identifier: RouteIdentifier, exact?: boolean) {
    if (exact) {
      return route?.identifier === identifier
    }

    if (routes[identifier]) {
      if (hydration.root) {
        HydrationManager.getSingletonInstance().requireRouteForHydration(identifier)
      }

      return !!route?.pattern?.startsWith(routes[identifier])
    }

    return false
  }

  return {
    current: route,
    isCurrent,
  }
}
