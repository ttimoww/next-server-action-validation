import { ZodSchema } from 'zod';
import { ValidationError } from './types';

/**
 * Validates the data with the given zod schema, and if it is valid, runs the given function.
 * @param schema The zod schema to validate the data with
 * @param func The function to run if the data is valid
 * @returns The function to run if the data is valid, or a function that returns a promise of a validation error
 */
export function withValidation<T, F extends (_data: T) => any>(
    schema: ZodSchema<T>,
    func: F
): F | ((data: T) => Promise<ValidationError>) {
    return (async (data: any) => {
        const zodValidationResult = schema.safeParse(data);

        if (!zodValidationResult.success) {
            return <ValidationError>{
                isValidationError: true,
                errors: zodValidationResult.error.errors
            };
        }

        return func(zodValidationResult.data);
    }) as F;
}
