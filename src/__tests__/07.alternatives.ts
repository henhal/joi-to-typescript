import Joi from 'joi';

import { convertSchema, Settings, convertFromDirectory } from '../index';
import { readFileSync } from 'fs';

test('07.alternatives', async () => {
  const basicSchema = Joi.alternatives()
    .try(Joi.number(), Joi.string())
    .label('BasicAltSchema')
    .description('a test schema definition');

  const basicRes = convertSchema(({ defaultToRequired: true } as unknown) as Settings, basicSchema);

  expect(basicRes[0].content).toBe(`/**
 * a test schema definition
 */
export type BasicAltSchema = number | string;`);

  const interfaceDirectory = './src/__tests__/07/models';
  const result = await convertFromDirectory({
    schemaDirectory: './src/__tests__/07/schemas',
    interfaceDirectory
  });

  expect(result).toBe(true);

  const oneContent = readFileSync(`${interfaceDirectory}/One.ts`).toString();
  expect(oneContent).toBe(
    `/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

/**
 * a test schema definition
 */
export type Basic = number | string;

/**
 * Other
 */
export interface Other {
  /**
   * other
   */
  other?: string;
}

/**
 * a test schema definition
 */
export interface Test {
  /**
   * a test schema definition
   */
  basic?: number | string;
  /**
   * name
   */
  name?: string;
  /**
   * value
   */
  value?: Thing | Other;
}

/**
 * A list of Test object
 */
export type TestList = (boolean | string)[];

/**
 * Thing
 */
export interface Thing {
  /**
   * thing
   */
  thing: string;
}
`
  );
});
