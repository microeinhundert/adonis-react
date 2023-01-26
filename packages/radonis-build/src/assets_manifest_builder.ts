/*
 * @microeinhundert/radonis-build
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Asset, AssetsManifest, HydrationRequirements } from '@microeinhundert/radonis-types'
import { AssetType } from '@microeinhundert/radonis-types'

import type { BuiltAsset, BuiltAssets } from './types/main'
import { dedupe, nonNull } from './utils'

/**
 * @internal
 */
export class AssetsManifestBuilder {
  /**
   * The built assets
   */
  #builtAssets: BuiltAssets

  constructor(builtAssets: BuiltAssets) {
    this.#builtAssets = builtAssets
  }

  /**
   * Build the assets manifest
   */
  build(): AssetsManifest {
    return nonNull(Array.from(this.#builtAssets).flatMap(([_, asset]) => this.#createEntry(asset)))
  }

  /**
   * Reduce the hydration requirements of multiple entries down to a single entry
   */
  #reduceHydrationRequirements(assets: Asset[]): HydrationRequirements {
    const { flashMessages, messages, routes } = assets.reduce<HydrationRequirements>(
      (requirements, entry) => ({
        flashMessages: [...requirements.flashMessages, ...entry.flashMessages],
        messages: [...requirements.messages, ...entry.messages],
        routes: [...requirements.routes, ...entry.routes],
      }),
      {
        flashMessages: [],
        messages: [],
        routes: [],
      }
    )

    return {
      flashMessages: dedupe(flashMessages),
      messages: dedupe(messages),
      routes: dedupe(routes),
    }
  }

  /**
   * Create the entry for an asset
   */
  #createEntry({ imports, ...asset }: BuiltAsset): Asset | null {
    const chunks = nonNull(
      imports.map(({ path: importPath, external }) => {
        if (external) {
          return null
        }

        const chunkAsset = this.#builtAssets.get(importPath)
        if (!chunkAsset || chunkAsset.type !== AssetType.ChunkScript) {
          return null
        }

        return this.#createEntry(chunkAsset)
      })
    )

    if (chunks.length) {
      return {
        ...asset,
        ...this.#reduceHydrationRequirements([asset, ...chunks]),
      }
    }

    return asset
  }
}
