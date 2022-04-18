/*
 * @microeinhundert/radonis-hooks
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { getManifestOrFail } from '@microeinhundert/radonis-shared'

export function useManifest() {
  return getManifestOrFail()
}
