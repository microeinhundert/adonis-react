/*
 * @microeinhundert/radonis-build
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { basename, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

import { AssetType } from '@microeinhundert/radonis-types'
import type { Plugin } from 'esbuild'
import { outputFile } from 'fs-extra'

import type { AssetsPluginOptions, BuiltAssets, IslandsByFile } from '../types/main'
import { extractFlashMessages, extractMessages, extractRoutes, getOutputMeta } from '../utils'

/**
 * @internal
 */
export const assetsPlugin = (options: AssetsPluginOptions): Plugin => ({
  name: 'radonis-assets',
  setup({ onStart, onResolve, onEnd, initialOptions }) {
    const islandsByFile: IslandsByFile = new Map()

    onStart(() => {
      islandsByFile.clear()
    })

    onResolve({ filter: /.*/, namespace: AssetType.IslandScript }, async ({ pluginData }) => {
      if (pluginData?.islands?.length && pluginData?.originalPath) {
        islandsByFile.set(pluginData.originalPath, pluginData.islands)
      }

      return null
    })

    onEnd(({ outputFiles, metafile }) => {
      const builtAssets: BuiltAssets = new Map()

      for (const { path, text, contents } of outputFiles ?? []) {
        if (options.outputToDisk) {
          outputFile(path, contents)
        }

        const pathRelativeToOutbase = relative(initialOptions.outbase!, path)
        const pathRelativeToPublic = relative(options.publicPath, path)

        const output = metafile?.outputs[pathRelativeToOutbase]
        if (!output) {
          continue
        }

        try {
          const { type, originalPath } = getOutputMeta(output)

          const fileURL = pathToFileURL(join('/', pathRelativeToPublic))
          const isIslandScript = type === AssetType.IslandScript
          const islands = isIslandScript && originalPath ? islandsByFile.get(originalPath) : null

          builtAssets.set(pathRelativeToOutbase, {
            type,
            name: basename(pathRelativeToOutbase),
            path: fileURL.pathname,
            islands: islands ?? [],
            imports: output.imports,
            flashMessages: extractFlashMessages(text),
            messages: extractMessages(text),
            routes: extractRoutes(text),
          })
        } catch {
          continue
        }
      }

      options.onEnd?.(builtAssets)
    })
  },
})
