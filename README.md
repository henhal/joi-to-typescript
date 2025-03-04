# joi-to-typescript

[![NPM version][npm-image]][npm-url] ![Latest Build](https://github.com/mrjono1/joi-to-typescript/workflows/Node.js%20CI/badge.svg) ![NPM Release Build](https://github.com/mrjono1/joi-to-typescript/workflows/Node.js%20Package/badge.svg) ![GitHub top language](https://img.shields.io/github/languages/top/mrjono1/joi-to-typescript) [![codecov](https://codecov.io/gh/mrjono1/joi-to-typescript/branch/master/graph/badge.svg?token=7UtmWfj5cA)](https://codecov.io/gh/mrjono1/joi-to-typescript)

[joi-to-typescript on GitHub](https://github.com/mrjono1/joi-to-typescript)

[npm-image]: https://img.shields.io/npm/v/joi-to-typescript.svg?style=flat
[npm-url]: https://www.npmjs.com/package/joi-to-typescript

Convert [Joi](https://github.com/sideway/joi) Schemas to TypeScript interfaces

This will allow you to reuse a Joi Schema that validates your [Hapi](https://github.com/hapijs/hapi) API to generate TypeScript interfaces so you don't have to manually create the same structure again saving you time.

For generating Open Api/Swagger this project works with

- [joi-to-swagger](https://github.com/Twipped/joi-to-swagger) using `.meta({className:''})` looking like a better approach
- [hapi-swagger](https://github.com/glennjones/hapi-swagger) using `.label('')` this has been well tested and used in production

Version 2, why the move to `.meta({className:'')` from `.label('')`? `Joi.label()` is intended to be used for meaningful error message, using it for another purpose makes the Joi loose a standard feature, this is especially noticeable for frontend usages of Joi. The choice of the property `className` is because this property is used by joi-to-swagger making this project work with other projects is important.

## Installation Notes

This package is intended as a development time tool so is installed in the `devDependencies`

```bash
yarn add joi-to-typescript --dev
# or
npm install joi-to-typescript --save-dev
```

- This has been built for `"joi": "^17"` and will not work for older versions
- Minimum node version 12 as Joi requires node 12

## Suggested Usage

1. Create a Schemas Folder eg. `src/schemas`
1. Create a interfaces Folder eg. `src/interfaces`
1. Create Joi Schemas in the Schemas folder with a file name suffix of Schemas eg. `AddressSchema.ts`
   - The file name suffix ensures that type file and schema file imports are not confusing

## Example

#### Example Project

Explore the [Example Project](https://github.com/mrjono1/joi-to-typescript/tree/master/example) for recommended setup, it allows the use of `yarn types` or `npm run types` to run this package

#### Example Schema

This example can be found in `src/__tests__/readme`

```typescript
import Joi from 'joi';

// Input
export const JobSchema = Joi.object({
  businessName: Joi.string().required(),
  jobTitle: Joi.string().required()
}).meta({ className: 'Job' });

export const WalletSchema = Joi.object({
  usd: Joi.number().required(),
  eur: Joi.number().required()
})
  .unknown()
  .meta({ className: 'Wallet', unknownType: 'number' });

export const PersonSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required().description('Last Name'),
  job: JobSchema,
  wallet: WalletSchema
}).meta({ className: 'Person' });

export const PeopleSchema = Joi.array()
  .items(PersonSchema)
  .required()
  .meta({ className: 'People' })
  .description('A list of People');

// Output
/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface Job {
  businessName: string;
  jobTitle: string;
}

/**
 * A list of People
 */
export type People = Person[];

export interface Person {
  firstName: string;
  job?: Job;
  /**
   * Last Name
   */
  lastName: string;
  wallet?: Wallet;
}

export interface Wallet {
  /**
   * Number Property
   */
  [x: string]: number;
  eur: number;
  usd: number;
}
```

##### Points of Interest

- `export const PersonSchema` schema must be exported
- `export const PersonSchema` includes a suffix of Schema so the schema and interface are not confused when using `import` statements (recommended not required)
- `.meta({ className: 'Person' });` Sets `interface` name using TypeScript conventions (TitleCase Interface name, camelCase property name)
- `.meta({ unknownType: 'number' });` assert unknown type to `number`

#### Upgrade Notice

- Version 1 used `.label('Person')` as the way to define the `interface` name, to use this option set `{ useLabelAsInterfaceName: true }`

#### Example Call

```typescript
import { convertFromDirectory } from 'joi-to-typescript';

convertFromDirectory({
  schemaDirectory: './src/schemas',
  typeOutputDirectory: './src/interfaces',
  debug: true
});

// or to get an interface as a string. Please note that this method is limited
import { convertSchema } from 'joi-to-typescript';
const resultingInterface = convertSchema({}, JobSchema);
resultingInterface?.content = // the interface as a string
```

## Settings

```typescript
export interface Settings {
  /**
   * The input/schema directory
   * Directory must exist
   */
  schemaDirectory: string;
  /**
   * The output/type directory
   * Will also attempt to create this directory
   */
  typeOutputDirectory: string;
  /**
   * Use .label('InterfaceName') instead of .meta({className:'InterfaceName'}) for interface names
   */
  useLabelAsInterfaceName: boolean;
  /**
   * Should interface properties be defaulted to optional or required
   * @default false
   */
  defaultToRequired: boolean;
  /**
   * What schema file name suffix will be removed when creating the interface file name
   * @default "Schema"
   * This ensures that an interface and Schema with the file name are not confused
   */
  schemaFileSuffix: string;
  /**
   * If `true` the console will include more information
   * @default false
   */
  debug: boolean;
  /**
   * File Header content for generated files
   */
  fileHeader: string;
  /**
   * If true will sort properties on interface by name
   * @default true
   */
  sortPropertiesByName: boolean;
  /**
   * If true will not output to subDirectories in output/interface directory. It will flatten the structure.
   */
  flattenTree: boolean;
  /**
   * If true will only read the files in the root directory of the input/schema directory. Will not parse through sub-directories.
   */
  rootDirectoryOnly: boolean;
  /**
   * If true will write all exports *'s to root index.ts in output/interface directory.
   */
  indexAllToRoot: boolean;
  /**
   * Comment every interface and property even with just a duplicate of the interface and property name
   * @default false
   */
  commentEverything: boolean;
  /**
   * List of files or folders that should be ignored from conversion. These can either be
   * filenames (AddressSchema.ts) or filepaths postfixed with a / (addressSchemas/)
   * @default []
   */
  ignoreFiles: string[];
  /**
   * The indentation characters
   * @default '  ' (two spaces)
   */
  indentationChacters: string;
}
```

## Joi Features Supported

- `.meta({className:'InterfaceName'})` - interface Name and in jsDoc
- `.description('What this interface is for')` - jsdoc
- `.valid(['red', 'green', 'blue'])` - enumerations
- `.optional()` - optional properties `?`
- `.required()` - required properties
- `.array()`, `.object()`, `.string()`, `.number()`, `.boolean()` - standard Joi schemas
- `.alternatives()`
- `.allow('')` - will be ignored on a string
- `.allow(null)` - will add as an optional type eg `string | null`
- `.unknown(true)` - will add a property `[x: string]: unknown;` to the interface
  - Assert `unknown` to some type with a stringified type or a Joi schema, e.g.:
  ```typescript
    .meta({ unknownType: 'some-type' })
  ```
  ```typescript
    .meta({ unknownType: Joi.object({ id: Joi.string() }) })`
  ```
- `.example()` - jsdoc
- `.cast()` - currently will honor casting to string and number types, map and set to be added later
- And many others

## Contributing

- Raise or comment on an [Issue](https://github.com/mrjono1/joi-to-typescript/issues) with a bug or feature request
- Contribute code via Raising a [Pull Request](https://github.com/mrjono1/joi-to-typescript/pulls)
- Start a [Discussion](https://github.com/mrjono1/joi-to-typescript/discussions)

### Recommended Development Environment

Recommended Editor is VS Code, this project is setup with VSCode settings in the `./.vscode` directory to keep development consistent.

Best developed on macOS, Linux, or on Windows via WSL.
Node 12, 14, or 16

Install [nodejs](https://nodejs.org/) via [nvm](https://github.com/nvm-sh/nvm) so you can have multiple versions installed

```bash
nvm use # using NVM to select node version
yarn install # using yarn
yarn test # run local tests

yarn coverage # test coverage report
yarn lint # lint the code
```
