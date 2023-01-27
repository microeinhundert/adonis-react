/*
 * @microeinhundert/radonis-hooks
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { E_CANNOT_USE_ON_CLIENT } from '../../exceptions/cannot_use_on_client'
import { useHttpContext } from './use_http_context'

/**
 * Hook for retrieving the AdonisJS `RequestContract`
 * @see https://radonis.vercel.app/docs/hooks/use-request
 */
export function useRequest() {
  try {
    const { request } = useHttpContext()

    return request
  } catch {
    throw new E_CANNOT_USE_ON_CLIENT(['useRequest'])
  }
}
