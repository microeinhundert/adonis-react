# Radonis Documentation

Easily bridge the gap between your [React](https://reactjs.org/) frontend and [AdonisJS](https://adonisjs.com/) backend.
Get DX similar to [Remix](https://remix.run/) while having the power of [AdonisJS](https://adonisjs.com/) at your fingertips.
This package is similar to [Inertia.js](https://inertiajs.com/), but does not offload all the rendering work to the client.
It's like a traditional monolythic application architecture with modern, SPA-like DX.

## Getting Started

### 1. Install the packages

Install the two Radonis core packages from your command line:

```console
npm install --save @microeinhundert/radonis @microeinhundert/radonis-server
```

### 2. Configure the server package

```console
node ace configure @microeinhundert/radonis-server
```

### 3. Configure AdonisJS addons

Configure the required AdonisJS addons if not already done:

```console
node ace configure @adonisjs/i18n
```

and

```console
node ace configure @adonisjs/session
```

> **Note**: These addons were automatically installed as part of the `node ace configure` command.

### 4. Register generated types (Optional)

For additional type safety, add the dynamically generated Radonis types to the `files` array of your `tsconfig.json` and exclude the `tmp` directory:

```json
{
  "exclude": ["tmp"],
  "files": ["./tmp/types/radonis.d.ts"]
}
```

## Server-Side Templating

Instead of Edge, Radonis uses React to render views on the server. This makes it possible to use the same templating language on both the server and the client.

Usage in controllers:

```typescript
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Index, Show } from 'resources/views/Users.tsx' // Where you put your views and how you structure them is completely your choice

export default class UsersController {
  public index({ radonis }: HttpContextContract) {
    return radonis.render(Index)
  }

  public show({ radonis }: HttpContextContract) {
    return radonis.render(Show)
  }
}
```

Usage in routes:

```typescript
import Route from '@ioc:Adonis/Core/Route'
import { SignUp } from '../resources/views/Auth.tsx'

Route.get('/signUp', async ({ radonis }) => {
  return radonis.render(SignUp)
})
```

### Adding tags to the head of the page

To modify the `<head>` of a page, use the `useHead` hook in your views:

```tsx
import { useHead } from '@ioc:Microeinhundert/Radonis'

function View() {
  const head = useHead()

  // Set the <title> tag
  head.setTitle('Welcome')

  // Add <meta> tags
  head.addMeta({
    viewport: 'width=device-width, initial-scale=1.0',
  })

  return <SomeComponent>Hello World!</SomeComponent>
}
```

You can optionally pass `<head>` data directly to the render call as the third argument:

```typescript
import Route from '@ioc:Adonis/Core/Route'
import { SignUp } from '../resources/views/Auth.tsx'

Route.get('/signUp', async ({ radonis }) => {
  return radonis.render(SignUp, undefined, {
    title: 'Sign up',
    meta: { viewport: 'width=device-width, initial-scale=1.0' },
  })
})
```

You can also add meta by calling `withMeta` in your controllers, routes, middlewares or everywhere `radonis` is available on the HttpContext:

```typescript
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Index, Show } from 'resources/views/Users.tsx'

export default class UsersController {
  public index({ radonis }: HttpContextContract) {
    return radonis.withMeta({ viewport: 'width=device-width, initial-scale=1.0' }).render(Index)
  }
}
```

You can also add miscellaneous data like tracking scripts to the head the same way by using `withHeadData`:

```typescript
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Index, Show } from 'resources/views/Users.tsx'

export default class UsersController {
  public index({ radonis }: HttpContextContract) {
    return radonis.withHeadData('<script>alert("Hello")</script>').render(Index)
  }
}
```

> **Note**: Data passed to methods of the `useHead` hook is always prioritized over data passed to `render` or methods of the HttpContext `radonis` object.

## The Manifest

The manifest is where Radonis stores all its data, like props of a component or translation messages. This manifest is also accessible client-side, which makes client-side hydration possible.
By default, Radonis limits the client manifest to only include data required for client-side hydration. However, if your specific use case requires having the same manifest on both the client and the server, set `client.limitManifest` to `false` in the Radonis config.

### Extending the manifest

You can also add your own data to the manifest, for example the currently logged in user or some global application settings. To extend the manifest, first add the types for your custom data to `contracts/radonis.ts` inside of the `Globals` interface. Then, call `withGlobals` in your controllers, routes, middlewares or everywhere `radonis` is available on the HttpContext:

```typescript
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Index, Show } from 'resources/views/Users.tsx'

export default class UsersController {
  public index({ radonis }: HttpContextContract) {
    return radonis.withGlobals({ user: { id: 1, email: 'radonis@example.com' } }).render(Index)
  }
}
```

You can optionally pass globals directly to the render call as the third argument:

```typescript
import Route from '@ioc:Adonis/Core/Route'
import { SignUp } from '../resources/views/Auth.tsx'

Route.get('/signUp', async ({ radonis }) => {
  return radonis.render(SignUp, undefined, {
    globals: { user: { id: 1, email: 'radonis@example.com' } },
  })
})
```

Access your custom globals with the `useGlobals` hook:

```typescript
import { useGlobals } from '@microeinhundert/radonis'

const globals = useGlobals()

console.log(globals) // => `{ user: { id: 1, email: 'radonis@example.com' } }`
```

> **Note**: Globals are set on a per-request basis. Use a custom middleware if you need some globals on all routes.

## Using Client-Side Hydration

Radonis uses partial hydration, which only hydrates parts of the page that require interactivity on the client.
In order for Radonis to know what to hydrate on the client, wrap the individual components with the _HydrationRoot_ component:

```tsx
import { HydrationRoot } from '@ioc:Microeinhundert/Radonis'

function ServerRenderedComponent() {
  return (
    <HydrationRoot component="SomeInteractiveComponent">
      <SomeInteractiveComponent someProp="test">This component will be hydrated client-side</SomeInteractiveComponent>
    </HydrationRoot>
  )
}
```

### Things to keep in mind when working with HydrationRoots

- HydrationRoots only accept a single child. If you want to hydrate multiple parts of your application, use multiple HydrationRoots instead.
- All props passed to the direct child of an HydrationRoot must be serializable.
- HydrationRoots cannot be nested.
- Hydration will only take place once the HydrationRoot is in view.

### Passing model data to client-side hydrated components

In order for data to be of the same format on both the server and the client, you have to use a custom naming strategy for your Lucid models.
This makes sure properties are kept in camelCase after serialization.

```ts
// app/Strategies/CamelCaseNamingStrategy.ts
import { string } from '@ioc:Adonis/Core/Helpers'
import { SnakeCaseNamingStrategy, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class CamelCaseNamingStrategy extends SnakeCaseNamingStrategy {
  public serializedName(_model: typeof BaseModel, propertyName: string) {
    return string.camelCase(propertyName)
  }
}
```

```ts
// app/Models/YourModel.ts
import CamelCaseNamingStrategy from 'App/Strategies/CamelCaseNamingStrategy'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class YourModel extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()
}
```

## Forms

By default, Radonis applications work like a traditional monolythic application: Forms are submitted and trigger a page reload, no JavaScript required. With the help of client-side hydration and flash messages, this "old school" way of handling user input comes really close to the modern UX known from Single Page Applications. But there are cases, being some small interaction like a "Add to favorites" button or a whole form, where communicating with the backend via fetch comes in handy and delivers a better UX for the user. Radonis ships with a form component that can do both, and switching between submit and fetch is as simple as adding a prop to the form component.

```tsx
import { Form } from '@microeinhundert/radonis'

type Data = {
  title: string
  description: string
}

type Error = Record<keyof Data, string | undefined>

function FetchFormDemo() {
  return (
    <Form<Data, Error>
      method="post" // or `get`, `put`, `delete`, `patch`
      action="YourController.store"
      params={{ someParam: 'hello' }}
      queryParams={{ someQueryParam: 'world' }}
      hooks={{
        onMutate: ({ input }) => {
          // Do something before the mutation runs

          return () => {
            // Rollback changes if the mutation failed
          }
        },
        onSuccess: ({ data, input }) => {
          // Do something once the mutation succeeded
        },
        onFailure: ({ error, rollback, input }) => {
          // Do something once the mutation failed,
          // like executing the rollback
          rollback?.()
        },
        onSettled: ({ status, error, data, rollback, input }) => {
          switch (status) {
            case 'success': {
              // Do something if the mutation succeeded
            }
            case 'failure': {
              // Do something if the mutation failed
            }
          }
        },
      }}
    >
      {({ status, error }) => {
        const isSubmitting = status === 'running'

        return (
          <>
            <label>
              <span>Title</span>
              <input name="title" type="text" required />
              {error?.title && <span>Validation failed</span>}
            </label>
            <label>
              <span>Description</span>
              <textarea name="description" required />
              {error?.description && <span>Validation failed</span>}
            </label>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </>
        )
      }}
    </Form>
  )
}
```

To submit the form traditionally, simply add the `reloadDocument` prop to the form component and switch to flash messages for validation:

```tsx
import { useFlashMessages, Form } from '@microeinhundert/radonis'

function TraditionalFormDemo() {
  const flashMessages = useFlashMessages()

  return (
    <Form
      method="post" // or `get`, `put`, `delete`, `patch`
      action="YourController.store"
      params={{ someParam: 'hello' }}
      queryParams={{ someQueryParam: 'world' }}
      reloadDocument // Reload the document like a <form> would do natively
    >
      <label>
        <span>Title</span>
        <input name="title" type="text" required />
        {flashMessages.hasError('title') && <span>{flashMessages.getError('title')}</span>}
      </label>
      <label>
        <span>Description</span>
        <textarea name="description" required />
        {flashMessages.hasError('description') && <span>{flashMessages.getError('description')}</span>}
      </label>
      <button type="submit">Submit</button>
    </Form>
  )
}
```

When JavaScript is not available, fetch forms will gracefully fall back to a traditional submit. But then you must make sure that validation will work in both cases, fetch and traditional submit.

> **Note**: When using methods other than `get` or `post`, `allowMethodSpoofing` must be set to `true` in the AdonisJS config. The `hooks` prop as well as the render props do not work in conjunction with `reloadDocument`.

## Hooks

### useHydration (Server and client)

```typescript
import { useHydration } from '@microeinhundert/radonis'

const hydration = useHydration()

// Get info about the HydrationRoot the component is a child of:
console.log(hydration) // => `{ hydrated: false, root: ':Rl6:', component: 'SomeInteractiveComponent', propsHash: 'cf5aff6dac00648098a9' }`

// By combining useHydration and useManifest, you can get the props of the component
// passed to the HydrationRoot from any component in the tree:
const hydration = useHydration()
const manifest = useManifest()

console.log(manifest.props[hydration.propsHash]) // => `{ someProp: 'test' }`
```

### useHydrated (Server and client)

This hook allows checking if a component was hydrated.

```typescript
import { useHydrated } from '@microeinhundert/radonis'

const hydrated = useHydrated()

console.log(hydrated) // => `true` if it was hydrated or `false` if not
```

### useI18n (Server and client)

```typescript
import { useI18n } from '@microeinhundert/radonis'

const i18n = useI18n()

// Get a translated message:
console.log(i18n.formatMessage('auth.signUpTitle')) // => `Some message defined in translations`
```

> **Note**: This hook also allows formatting via the ICU message format, just like the official AdonisJS i18n package. Refer to the official [AdonisJS documentation](https://docs.adonisjs.com/guides/i18n) for more information about the available formatting rules.

### useManifest (Server and client)

```typescript
import { useManifest } from '@microeinhundert/radonis'

const manifest = useManifest()

// Get the manifest:
console.log(manifest) // => `{ props: {}, globals: {}, flashMessages: {}, locale: 'en', messages: {}, routes: {}, route: {} }`
```

> **Note**: The manifest differs between server-side rendering and client-side hydration, therefore don't use this hook inside of components you plan to hydrate on the client. However, if your specific use case requires having the same manifest on both the client and the server, set `client.limitManifest` to `false` in the Radonis config.

### useGlobals (Server and client)

```typescript
import { useGlobals } from '@microeinhundert/radonis'

const globals = useGlobals()

// Get the globals:
console.log(globals) // => `{}`
```

### useRoute (Server and client)

```typescript
import { useRoute } from '@microeinhundert/radonis'

const route = useRoute()

// Get the current route:
console.log(route.current) // => `{ name: 'users.show', pattern: '/users/:id' }`

// Check if a route matches the current route:
console.log(route.isCurrent('users.show')) // => `true` if currently on `users.show` or a child of `users.show`, `false` if not

// Check if a route matches the current route exactly:
console.log(route.isCurrent('users.show', true)) // => `true` if currently on `users.show`, `false` if not
```

### useRoutes (Server and client)

```typescript
import { useRoutes } from '@microeinhundert/radonis'

const routes = useRoutes()

// Get all routes as object:
console.log(routes) // => `{ 'drive.local.serve': '/uploads/*', ... }`
```

### useUrlBuilder (Server and client)

```typescript
import { useUrlBuilder } from '@microeinhundert/radonis'

const urlBuilder = useUrlBuilder()

// Build the URL for a named route:
const url = urlBuilder.make('signUp') // => `/signUp`

// Build the URL for a controller:
const url = urlBuilder.make('users.index') // => `/users`

// Build the URL with params:
const url = urlBuilder.withParams({ id: 1 }).make('users.show') // => `/users/1`

// You can also provide query params:
const url = urlBuilder.withQueryParams({ cool: ['adonis', 'react'] }).make('tech.index') // => `/tech?cool=adonis,react
```

### useFlashMessages (Server and client)

```typescript
import { useFlashMessages } from '@microeinhundert/radonis'

const flashMessages = useFlashMessages()

// Check if any flash message exists:
console.log(flashMessages.has()) // => `true` or `false`

// Check if any error flash message exists:
console.log(flashMessages.hasError()) // => `true` or `false`

// Check if some specific flash message exists:
console.log(flashMessages.has('errors.fieldName.0')) // => `true` or `false`

// Check if some specific error flash message exists:
console.log(flashMessages.hasError('fieldName.0')) // => `true` or `false`

// Get some specific flash message:
console.log(flashMessages.get('errors.fieldName.0')) // => `required validation failed on fieldName`

// You can also omit the index to automatically get the first item from an array:
console.log(flashMessages.get('errors.fieldName')) // => same as `errors.fieldName.0`

// You can also get some specific error flash message like this:
console.log(flashMessages.getError('fieldName')) // => same as `errors.fieldName`

// Get all flash messages:
console.log(flashMessages.all()) // => `{ 'errors.fieldName.0': 'required validation failed on fieldName', ... }`

// Get all error flash messages:
console.log(flashMessages.allErrors()) // => `{ 'errors.fieldName.0': 'required validation failed on fieldName', ... }`
```

### useMutation (Client only)

```typescript
import { useMutation, useUrlBuilder } from '@microeinhundert/radonis'

const urlBuilder = useUrlBuilder()

// Create a function that runs the mutation:
async function storeComment({ postId, authorId, comment }: { postId: string; authorId: string; comment: string }) {
  const response = await fetch(urlBuilder.withParams({ id: postId }).make('PostsController.storeComment'), {
    method: 'POST',
    body: JSON.stringify({ authorId, comment }),
  })

  if (!response.ok) throw new Error(response.statusText)

  return response.json()
}

// Use this function with the `useMutation` hook:
const [mutate, { status }] = useMutation(storeComment)

// Execute the mutation:
mutate({ postId, authorId, comment })
```

For the following hooks, refer to the official [AdonisJS documentation](https://docs.adonisjs.com/guides/introduction), as these hooks just proxy AdonisJS contracts.

### useAdonis (Server only)

Returns info about the AdonisJS instance in the following format:

```typescript
interface AdonisContextContract {
  application: ApplicationContract
  httpContext: HttpContextContract
  router: RouterContract
}
```

Usage:

```typescript
import { useAdonis } from '@ioc:Microeinhundert/Radonis'

const adonis = useAdonis()
```

### useApplication (Server only)

Returns the AdonisJS _ApplicationContract_.

```typescript
import { useApplication } from '@ioc:Microeinhundert/Radonis'

const application = useApplication()
```

### useHttpContext (Server only)

Returns the AdonisJS _HttpContextContract_.

```typescript
import { useHttpContext } from '@ioc:Microeinhundert/Radonis'

const httpContext = useHttpContext()
```

### useRequest (Server only)

Returns the AdonisJS _RequestContract_.

```typescript
import { useRequest } from '@ioc:Microeinhundert/Radonis'

const request = useRequest()
```

### useRouter (Server only)

Returns the AdonisJS _RouterContract_.

```typescript
import { useRouter } from '@ioc:Microeinhundert/Radonis'

const router = useRouter()
```

### useSession (Server only)

Returns the AdonisJS _SessionContract_.

```typescript
import { useSession } from '@ioc:Microeinhundert/Radonis'

const session = useSession()
```

## Cookbooks

- [CSRF Handling](cookbooks/csrf.md)
- [Creating A Form Input Component](cookbooks/form-input-component.md)
- [Creating A Plugin](cookbooks/plugin.md)

## Official Plugins

- [Twind](https://github.com/microeinhundert/radonis/tree/main/packages/radonis-twind)
- [UnoCSS](https://github.com/microeinhundert/radonis/tree/main/packages/radonis-unocss)
