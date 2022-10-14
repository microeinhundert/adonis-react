/*
 * @microeinhundert/radonis-hooks
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { useContext } from 'react'

import { serverContext } from '../../contexts/serverContext'
import { HookException } from '../../exceptions/hookException'

/**
 * Hook for retrieving the Radonis `ServerContract`
 * @see https://radonis.vercel.app/docs/hooks/use-server
 */
export function useServer() {
  const context = useContext(serverContext)

  if (!context) {
    throw HookException.cannotUseOnClient('useServer')
  }

  return context
}