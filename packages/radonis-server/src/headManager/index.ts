/*
 * @microeinhundert/radonis-server
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { RadonisConfig } from '@ioc:Microeinhundert/Radonis'
import { stringifyAttributes } from '@microeinhundert/radonis-shared'
import type { HeadContract, HeadMeta, HeadTag, ResetBetweenRequests } from '@microeinhundert/radonis-types'

import { buildTitle } from './utils/buildTitle'

/**
 * @internal
 */
export class HeadManager implements HeadContract, ResetBetweenRequests {
  /**
   * The Radonis config
   */
  #config: Pick<RadonisConfig, 'head'>

  /**
   * The title
   */
  #title: string

  /**
   * The meta
   */
  #meta: HeadMeta

  /**
   * The tags
   */
  #tags: HeadTag[]

  /**
   * Constructor
   */
  constructor(config: Pick<RadonisConfig, 'head'>) {
    this.#config = config
    this.#setDefaults()
  }

  /**
   * Set the defaults
   */
  #setDefaults() {
    this.setTitle(this.#config.head.title.default)
    this.#meta = this.#config.head.defaultMeta
    this.#tags = []
  }

  /**
   * Set the title
   */
  setTitle(title: string): void {
    const { prefix, suffix, separator } = this.#config.head.title

    this.#title = buildTitle(title, prefix, suffix, separator)
  }

  /**
   * Get the HTML title tag
   */
  getTitleTag(): string {
    return `<title>${this.#title}</title>`
  }

  /**
   * Add meta
   */
  addMeta(meta: HeadMeta): void {
    this.#meta = { ...this.#meta, ...meta }
  }

  /**
   * Get the HTML meta tags
   */
  getMetaTags(): string {
    return Object.entries(this.#meta)
      .map(([name, value]) => {
        if (!value) {
          return null
        }

        if (['charset', 'charSet'].includes(name)) {
          return `<meta ${stringifyAttributes({ charset: value })} />`
        }

        /*
         * Open Graph tags use the `property` attribute,
         * while other meta tags use `name`. See https://ogp.me/
         */
        const isOpenGraphTag = name.startsWith('og:')

        return [value].flat().map((content) => {
          if (typeof content !== 'string') {
            return `<meta ${stringifyAttributes(content)} />`
          }

          return `<meta ${stringifyAttributes({ content, [isOpenGraphTag ? 'property' : 'name']: name })} />`
        })
      })
      .join('\n')
  }

  /**
   * Add tags
   */
  addTags(tags: HeadTag[]): void {
    this.#tags = [...this.#tags, ...tags]
  }

  /**
   * Get the HTML tags
   */
  getTags(): string {
    return this.#tags
      .map(({ name, content, attributes }) => {
        return `<${name}${attributes ? ` ${stringifyAttributes(attributes)}` : ''}>${content}</${name}>`
      })
      .join('\n')
  }

  /**
   * Get all HTML
   */
  getHTML(): string {
    return [this.getTitleTag(), this.getMetaTags(), this.getTags()].join('\n')
  }

  /**
   * Reset for a new request
   */
  resetForNewRequest(): void {
    this.#setDefaults()
  }
}
