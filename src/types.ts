import { ZodIssue } from "zod";

export type ValidationError = {
    isValidationError: boolean;
    errors: ZodIssue[];
}