import type { RadonisConfig } from '@ioc:Adonis/Addons/Radonis'
import Application from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'

const radonisConfig: RadonisConfig = {
  /*
  |--------------------------------------------------------------------------
  | Production mode
  |--------------------------------------------------------------------------
  |
  | Enabling production mode will minify
  | and set the environment accordingly.
  |
  */
  productionMode: Env.get('NODE_ENV') === 'production',

  /*
  |--------------------------------------------------------------------------
  | Components dir
  |--------------------------------------------------------------------------
  |
  | The directory that contains all the components
  | to be built for hydration on the client.
  |
  */
  componentsDir: Application.resourcesPath('components'),

  /*
  |--------------------------------------------------------------------------
  | Client bundle output dir
  |--------------------------------------------------------------------------
  |
  | The directory the built client bundle
  | should be written to.
  |
  */
  clientBundleOutputDir: Application.publicPath('client'),

  /*
  |--------------------------------------------------------------------------
  | Build options
  |--------------------------------------------------------------------------
  |
  | Allows overriding the build options used
  | by esbuild for bundling the client.
  |
  | Use with caution: This is only an escape hatch.
  | Overriding the options can break the build.
  |
  */
  buildOptions: {},

  /*
  |--------------------------------------------------------------------------
  | Limit client manifest
  |--------------------------------------------------------------------------
  |
  | Limit the client manifest to only include data
  | required for hydration on the client.
  |
  */
  limitClientManifest: true,
}

export default radonisConfig
