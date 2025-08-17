import { z } from 'zod'

export const personFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  address: z.string().nullable().optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').nullable().optional()
})

export const visitFormSchema = z.object({
  visitedAt: z.string().transform((val) => {
    // Handle datetime-local format (YYYY-MM-DDTHH:mm) by adding seconds and timezone
    if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      return val + ':00.000Z'
    }
    return val
  }).pipe(z.string().datetime()),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').nullable().optional()
})

export const listPersonsSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
})

export type PersonFormData = z.infer<typeof personFormSchema>
export type VisitFormData = z.infer<typeof visitFormSchema>
export type ListPersonsInput = z.infer<typeof listPersonsSchema>

// Legacy exports for backward compatibility with backend
export const createPersonSchema = personFormSchema
export const updatePersonSchema = personFormSchema
export const recordVisitSchema = visitFormSchema

export type CreatePersonInput = PersonFormData
export type UpdatePersonInput = PersonFormData
export type RecordVisitInput = VisitFormData