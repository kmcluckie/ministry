import { z } from 'zod'

export const timeFormSchema = z.object({
  type: z.string().min(1, 'Type is required').max(255, 'Type must be less than 255 characters'),
  recordedOn: z.string().transform((val) => {
    // Handle date format (YYYY-MM-DD)
    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return val
    }
    // Handle datetime-local format by extracting date part
    if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
      return val.split('T')[0]
    }
    return val
  }).pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')),
  hours: z.number().int().min(0, 'Hours must be 0 or greater').max(24, 'Hours must be 24 or less'),
  minutes: z.number().int().min(0, 'Minutes must be 0 or greater').max(59, 'Minutes must be 59 or less')
})

export const listTimesSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  type: z.array(z.string()).optional(),
  month: z.object({
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12)
  }).optional(),
  serviceYear: z.number().int().min(2000).max(2100).optional()
})

export type TimeFormData = z.infer<typeof timeFormSchema>
export type ListTimesInput = z.infer<typeof listTimesSchema>

// API schemas
export const createTimeSchema = timeFormSchema
export const updateTimeSchema = timeFormSchema.partial()

export type CreateTimeInput = TimeFormData
export type UpdateTimeInput = z.infer<typeof updateTimeSchema>