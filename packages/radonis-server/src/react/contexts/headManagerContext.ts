/*
 * @microeinhundert/radonis-server
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createContext } from 'react'

import type { HeadManager } from '../../headManager'

/**
 * @internal
 */
export const headManagerContext = createContext<HeadManager>(null as any)

/**
 * @internal
 */
export const HeadManagerContextProvider = headManagerContext.Provider