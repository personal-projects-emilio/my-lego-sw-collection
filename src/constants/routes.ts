import { boolean, number, object, string, union } from 'zod'

const filterParam = union([string(), number(), boolean()]).optional()

export const filterSearchSchema = object({
  character: filterParam,
  location: filterParam,
  minifigId: filterParam,
  off: filterParam,
  owned: filterParam,
  q: filterParam,
  retired: filterParam,
  setId: filterParam,
  subtheme: filterParam,
  tags: filterParam,
  timeline: filterParam,
})

export const addMinifigSearchSchema = object({
  duplicate: string().optional(),
})

export const addSetSearchSchema = object({
  duplicate: string().or(number()).optional(),
})
