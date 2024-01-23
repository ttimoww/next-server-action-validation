import { ValidationError } from "./types";

export function isValidationError(obj: any): obj is ValidationError {
    return obj && obj.isValidationError === true;
}
