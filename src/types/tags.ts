export type TagTarget = 'sets' | 'minifigs'

export type Tag = {
  id: string
  label: string
  parent?: string
  order: number
  kind?: 'movie' | 'show' | 'game' | 'other'
  appliesTo?: TagTarget | 'both'
  inherited?: boolean
}

export type TagsList = Tag[]
