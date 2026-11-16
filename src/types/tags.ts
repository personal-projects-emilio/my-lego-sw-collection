export type TagTarget = 'sets' | 'minifigs'

export type TagId = string

export type Tag = {
  id: TagId
  label: string
  parent?: TagId
  order: number
  kind?: 'movie' | 'show' | 'game' | 'other'
  appliesTo?: TagTarget | 'both'
  inherited?: boolean
  alphabetical?: boolean
}

export type TagsList = Tag[]

export type InheritedTags = Record<TagId, Array<string | number>>

export type TaggedItem = {
  effectiveTags: TagId[]
  inheritedTags?: InheritedTags
}
