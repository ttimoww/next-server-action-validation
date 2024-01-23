# NextJS Server Action Validation

[![npm version](https://badge.fury.io/js/next-server-action-validation.svg)](https://www.npmjs.com/package/next-server-action-validation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This package provides an efficient and straightforward method for validating data in [NextJS Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations). It's designed to ensure that the data passed into server actions is validated on the server side, enhancing the security and reliability of your NextJS applications.

# Table of Contents

1. [Motivation](#Motivation)
2. [Solution](#Solution)
3. [Installation](#Installation)
4. [Usage](#Usage)
   - [Step 1. Protect your Server Action](#Step-1-Protect-your-Server-Action)
   - [Step 2. Use your Server Action](#Step-2-Use-your-Server-Action)
5. [API](#api)
   - [isValidationError](#isvalidationerror)
   - [withValidation](#withvalidation)
6. [Types](#types)
   - [ValidationError](#ValidationError)

## Motivation

NextJS Server Actions simplify back-end code execution, eliminating the need for manual API route creation. This increases developer productivity. However, they lack a crucial feature: **body validation**.

Using client-side validation, like Zod.js, is a good practice but it only provides partial security. Client-side validation does not protect your NextJS Server Actions from receiving invalid data directly, posing a potential risk.

## Solution

The solution to this issue is to integrate body validation within your server actions. This package allows you to use Zod.js schemas in your server actions, providing a robust and secure way to validate data. Additionally, it simplifies error handling by seamlessly communicating validation errors back to the client component.

## Installation

```bash
npm install next-server-action-validation zod
```

## Usage

This package uses [Zod](https://github.com/colinhacks/zod) for runtime validation of data passed into server actions

### Step 1: Protect your Server Action

To protect your server action it needs to be wrapped in the `withValidation` function together with a Zod.js validation schema.

```ts
// server-action.ts

'use server';

import * as z from 'zod';
import { withValidation } from 'next-server-action-validation';

// 1. Create the Validation Schema
const myServerActionSchema = z.object({
  name: z.string().min(4)
});

// 2. Wrap your server action in the `withValidation` function
export const myServerAction = withValidation(myServerActionSchema, async (data: { name: string }) => {
  console.log(data); // Data is fully typesafe
  return true;
});
```

### Step 2: Use your Server Action

To use your server action and check for validation errors we can simply call our action and pass its result into the `isValidationError` function. If this function resolves to be truthy the validation failed. From now on the type of our result is a `ValidationError` which holds all validation errors.

```jsx
// page.tsx

'use client';

import { useState } from 'react';
import { myServerAction } from '@/app/page.actions';
import { isValidationError } from 'next-server-action-validation';

export default function Home() {
  const [myString, setMyString] = useState('');

  async function handleSave() {
    // 1. Call your server action as normal
    const result = await myServerAction({ name: myString });

    // 2. Check for validation errors
    if (isValidationError(result)) {
      // The type of result.errors is an array of `ZodIssues`
      // which we can use to display proper error messages
      console.log(result.errors);

      // 3. Return out of the function
      return;
    }

    // 4. Proceed as normal
    console.log('We passed correct data!');
  }

  return (
    <main>
      <Input onChange={e => setMyString(e.target.value)} />
      <Button onClick={handleSave}>Save</Button>
    </main>
  );
}
```

## API

### `withValidation`

Validates data using a Zod schema and, if valid, executes a specified function.

#### Signature

```ts
function withValidation<T, F extends (_data: T) => any>(
  schema: ZodSchema<T>,
  func: F
): F | ((data: T) => Promise<ValidationError>);
```

#### Parameters

- `schema`: The Zod schema to validate the data against.
- `func`: The function to execute if the data is valid. This function should accept one argument of type T.

#### Returns

- If the data is valid, it returns the result of func.
- If the data is invalid, it returns a function that resolves to a ValidationError.

#### Description

The withValidation function is designed to facilitate the validation of data using a Zod schema before executing a specific function. It ensures that the provided function func is only called if the data satisfies the schema validation. In cases where the data fails the validation, a ValidationError object is returned, simplifying the error handling process.

### `isValidationError`

Checks if a given object is an instance of `ValidationError`.

#### Signature

```ts
function isValidationError(obj: any): boolean;
```

#### Parameters

- `obj`: The object to be checked.

#### Returns

- `boolean`: Returns true if the object is an instance of ValidationError, otherwise false.

## Types

### `ValidationError`

A type representing a validation error, typically used in conjunction with validation functions.

#### Definition

```typescript
export type ValidationError = {
  isValidationError: boolean;
  errors: ZodIssue[];
};
```
