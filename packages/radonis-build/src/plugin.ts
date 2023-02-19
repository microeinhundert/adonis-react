/*
 * @microeinhundert/radonis-build
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, relative } from 'node:path'

import { createInternalURL, stripLeadingSlash } from '@microeinhundert/radonis-shared'
import { ensureDirExists } from '@microeinhundert/radonis-shared/node'
import { AssetType } from '@microeinhundert/radonis-types'
import type { Plugin } from 'esbuild'
import { transform } from 'esbuild'

import { ISLAND_REGEX } from './constants'
import { getLoaderForFile } from './loaders'
import type { BuiltAssets, IslandsByFile, RadonisPluginOptions } from './types/main'
import { extractTokens, getOutputMeta } from './utils'

/**
 * Plugin for esbuild
 */
export function radonisPlugin(options: RadonisPluginOptions): Plugin {
  return {
    name: 'radonis',
    setup({ onResolve, onLoad, onEnd, initialOptions }) {
      const islandsByFile: IslandsByFile = new Map()

      function normalizePath(path: string, base?: string) {
        return createInternalURL(relative(base ?? initialOptions.outbase!, path)).pathname
      }

      /**
       * Process client scripts
       */
      onResolve({ filter: /\.client\.(ts(x)?|js(x)?)$/ }, ({ path, kind }) => {
        if (kind !== 'entry-point') {
          return null
        }

        return { path, namespace: AssetType.ClientScript }
      })
      onLoad({ filter: /.*/, namespace: AssetType.ClientScript }, async ({ path }) => {
        const contents = await readFile(path, { encoding: 'utf-8' })

        return {
          contents,
          resolveDir: dirname(path),
          loader: getLoaderForFile(path),
        }
      })

      /**
       * Process island scripts
       */
      onResolve({ filter: /\.island\.(ts(x)?|js(x)?)$/ }, ({ path, kind }) => {
        if (kind !== 'entry-point') {
          return null
        }

        return { path, namespace: AssetType.IslandScript }
      })
      onLoad({ filter: /.*/, namespace: AssetType.IslandScript }, async ({ path }) => {
        let contents = await readFile(path, { encoding: 'utf-8' })

        const matches = contents.matchAll(ISLAND_REGEX)
        const islands = new Set<string>()

        for (const match of matches) {
          const identifier = match?.groups?.identifier
          const symbol = match?.groups?.symbol

          if (!identifier || !symbol) {
            continue
          }

          islands.add(identifier)

          contents = contents.replace(match[0], `__internal__hydrateIsland('${identifier}', ${symbol})`)
        }

        contents = ["import { __internal__hydrateIsland } from '@microeinhundert/radonis';", contents].join('\n')

        islandsByFile.set(normalizePath(path), Array.from(islands))

        return {
          contents,
          resolveDir: dirname(path),
          loader: getLoaderForFile(path),
        }
      })

      onEnd(async ({ outputFiles, metafile }) => {
        if (!outputFiles) {
          return
        }

        const builtAssets: BuiltAssets = new Map()

        for (const { path, text, contents } of outputFiles) {
          await ensureDirExists(path)

          if (options.minify) {
            const transformResult = await transform(text, { minify: true })
            await writeFile(path, transformResult.code)
          } else {
            await writeFile(path, contents)
          }

          const pathRelativeToOutbase = normalizePath(path)
          const pathRelativeToPublic = normalizePath(path, options.publicPath)

          const assetKey = stripLeadingSlash(pathRelativeToOutbase)
          const output = metafile?.outputs[assetKey]
          if (!output) {
            continue
          }

          try {
            const { type, originalPath } = getOutputMeta(output)
            const islandFileKey = normalizePath(originalPath)

            builtAssets.set(assetKey, {
              type,
              name: basename(pathRelativeToOutbase),
              path: pathRelativeToPublic,
              islands: islandsByFile.get(islandFileKey) ?? [],
              imports: output.imports,
              tokens: extractTokens(text),
            })
          } catch {
            continue
          }
        }

        options.onEnd?.(builtAssets)
        islandsByFile.clear()
      })
    },
  }
}
