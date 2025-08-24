import { z } from 'zod'

export const reportFormSchema = z.object({
  month: z.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2000, 'Year must be 2000 or later').max(2100, 'Year must be 2100 or earlier'),
  studies: z.number().int().min(0, 'Studies must be 0 or greater'),
  ministryHours: z.number().int().min(0, 'Ministry hours must be 0 or greater').max(744, 'Ministry hours must be 744 or less'), // 31 days * 24 hours
  creditHours: z.number().int().min(0, 'Credit hours must be 0 or greater').max(744, 'Credit hours must be 744 or less')
})

export const listReportsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  serviceYear: z.number().int().min(2000).max(2100).optional(),
  month: z.object({
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12)
  }).optional()
})

export const reportDefaultsSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100)
})

export type ReportFormData = z.infer<typeof reportFormSchema>
export type ListReportsInput = z.infer<typeof listReportsSchema>
export type ReportDefaultsInput = z.infer<typeof reportDefaultsSchema>

// API schemas
export const createReportSchema = reportFormSchema
export const updateReportSchema = reportFormSchema.partial()

export type CreateReportInput = ReportFormData
export type UpdateReportInput = z.infer<typeof updateReportSchema>