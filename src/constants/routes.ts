import { number, object, string } from 'zod'

export const addMinifigSearchSchema = object({
  duplicate: string().optional(),
})

export const addSetSearchSchema = object({
  duplicate: string().or(number()).optional(),
})
