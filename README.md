# WebUtilities

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.10.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Cloudflare Pages

This project includes a `wrangler.jsonc` file for Cloudflare Pages. It sets the required `compatibility_date` and points Wrangler at Angular's browser build output.

To build for Cloudflare Pages:

```bash
npm run build:cloudflare
```

To deploy with Wrangler direct upload:

```bash
npm run deploy:cloudflare
```

If you configure Cloudflare Pages through the dashboard instead, use:

- Build command: `npm run build:cloudflare`
- Build output directory: `dist/web-utilities/browser`
- Production branch: `main`

Use `wrangler pages deploy`, not `wrangler deploy`, for Cloudflare Pages.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
