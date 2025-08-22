import type { Tables } from './database.types'

export type Person = Tables<'persons'>
export type Visit = Tables<'visits'>
export type TimeRecord = Tables<'time_records'>

// Report type (backend implemented but database types not yet generated)
export type Report = {
  id: string
  month: number
  year: number
  studies: number
  ministryHours: number
  creditHours: number
  totalHours: number
  periodKey: string
  createdAt: string
  updatedAt: string
}

export type TimeRecordType = 'Ministry' | 'LDC' | 'Other'

export type CreatePersonData = {
  name: string
  address?: string
  notes?: string
}

export type UpdatePersonData = {
  name?: string
  address?: string
  notes?: string
}

export type CreateVisitData = {
  person_id: string
  visited_at: string
  notes?: string
}

export type UpdateVisitData = {
  visited_at?: string
  notes?: string
}

export type CreateTimeRecordData = {
  type: TimeRecordType
  recorded_on: string
  hours: number
  minutes: number
}

export type UpdateTimeRecordData = {
  type?: TimeRecordType
  recorded_on?: string
  hours?: number
  minutes?: number
}

export type CreateReportData = {
  month: number
  year: number
  studies: number
  ministryHours: number
  creditHours: number
}

export type UpdateReportData = {
  month?: number
  year?: number
  studies?: number
  ministryHours?: number
  creditHours?: number
}