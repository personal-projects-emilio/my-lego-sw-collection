export type TagTarget = 'sets' | 'minifigs'

export type TagId = string

export type Tag = {
  id: TagId
  label: string
  parent?: TagId
  appliesTo?: TagTarget | 'both'
  inherited?: boolean
}

export type TagsList = Tag[]

export type InheritedTags = Record<TagId, Array<string | number>>

export type TaggedItem = {
  effectiveTags: TagId[]
  inheritedTags?: InheritedTags
}
