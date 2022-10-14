/*
 * @microeinhundert/radonis-hooks
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { useContext } from 'react'

import { manifestManagerContext } from '../../contexts/manifestManagerContext'
import { HookException } from '../../exceptions/hookException'

/**
 * Hook for retrieving the Radonis `ManifestManager` instance
 * @see https://radonis.vercel.app/docs/hooks/use-manifest-manager
 */
export function useManifestManager() {
  const context = useContext(manifestManagerContext)

  if (!context) {
    throw HookException.cannotUseOnClient('useManifestManager')
  }

  return context
}