export type Kind = 'movie' | 'show' | 'game' | 'book' | 'other'

export type TimelineId = string

export type TimelineEntry = {
  id: TimelineId
  label: string
  parent?: TimelineId
  kind?: Kind
  start?: number
  end?: number
}

export type TimelineList = TimelineEntry[]

export type InheritedAppearances = Record<TimelineId, Array<string | number>>
