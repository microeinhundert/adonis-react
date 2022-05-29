/*
 * @microeinhundert/radonis-server
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HydrationContextProvider, useHydration } from '@microeinhundert/radonis-hydrate'
import { invariant } from '@microeinhundert/radonis-shared'
import React, { useId } from 'react'

import type { HydrationRootProps } from '../../types'
import { useCompiler } from '../hooks/useCompiler'
import { useManifestBuilder } from '../hooks/useManifestBuilder'

export function HydrationRoot({ children, component: componentIdentifier }: HydrationRootProps) {
  const manifestBuilder = useManifestBuilder()
  const compiler = useCompiler()
  const { root: parentHydrationRootIdentifier, component: parentComponentIdentifier } = useHydration()
  const hydrationRootIdentifier = useId()

  /*
   * Fail if the HydrationRoot is nested inside another HydrationRoot
   */
  invariant(
    !parentHydrationRootIdentifier,
    `Found HydrationRoot "${hydrationRootIdentifier}" for component "${componentIdentifier}" nested inside HydrationRoot "${parentHydrationRootIdentifier}" for component "${parentComponentIdentifier}".
    This is not allowed, as each HydrationRoot acts as root for a React app when hydrated on the client`
  )

  const { props } = React.Children.only(children)

  /*
   * Register the props with the ManifestBuilder
   */
  const propsHash = manifestBuilder.registerProps(componentIdentifier, props)

  /*
   * Require the component for hydration on the Compiler
   */
  compiler.requireComponentForHydration(componentIdentifier)

  return (
    <HydrationContextProvider
      value={{ hydrated: false, root: hydrationRootIdentifier, component: componentIdentifier, propsHash }}
    >
      <div data-component={componentIdentifier} data-hydration-root={hydrationRootIdentifier} data-props={propsHash}>
        {children}
      </div>
    </HydrationContextProvider>
  )
}
