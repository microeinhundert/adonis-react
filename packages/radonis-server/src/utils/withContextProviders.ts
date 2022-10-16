/*
 * @microeinhundert/radonis-server
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  AssetsManagerContract,
  ManifestManagerContract,
  RendererContract,
  ServerContract,
} from '@microeinhundert/radonis-types'
import type { ReactElement } from 'react'
import { createElement as h } from 'react'

import { AssetsManagerContextProvider } from '../contexts/assetsManagerContext'
import { ManifestManagerContextProvider } from '../contexts/manifestManagerContext'
import { RendererContextProvider } from '../contexts/rendererContext'
import { ServerContextProvider } from '../contexts/serverContext'

/**
 * Wrap a ReactElement with the required context providers
 * @internal
 */
export function withContextProviders(
  renderer: RendererContract,
  assetsManager: AssetsManagerContract,
  manifestManager: ManifestManagerContract,
  server: ServerContract,
  children: ReactElement
): ReactElement {
  return h(
    AssetsManagerContextProvider,
    { value: assetsManager },
    h(
      ManifestManagerContextProvider,
      { value: manifestManager },
      h(RendererContextProvider, { value: renderer }, h(ServerContextProvider, { value: server }, children))
    )
  )
}
