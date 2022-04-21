import type { Loader } from 'esbuild'
import { extname } from 'path'

export const loaders: { [ext: string]: Loader } = {
  '.aac': 'file',
  '.eot': 'file',
  '.flac': 'file',
  '.gif': 'file',
  '.ico': 'file',
  '.jpeg': 'file',
  '.jpg': 'file',
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.json': 'json',
  '.mp3': 'file',
  '.mp4': 'file',
  '.ogg': 'file',
  '.otf': 'file',
  '.png': 'file',
  '.svg': 'file',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.ttf': 'file',
  '.wav': 'file',
  '.webm': 'file',
  '.webp': 'file',
  '.woff': 'file',
  '.woff2': 'file',
}

export function getLoaderForFile(file: string): Loader {
  const ext = extname(file)
  if (ext in loaders) return loaders[ext]
  throw new Error(`Cannot get loader for file ${file}`)
}
