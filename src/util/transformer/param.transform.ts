import { TransformFnParams } from "class-transformer";

export function s2n(params: TransformFnParams): number {
  const { value } = params
  return Number(value)
}

export function s2d(params: TransformFnParams): Date {
  const { value } = params
  return new Date(value)
}