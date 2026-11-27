import {
  getFieldLabel,
  type SetsFilter,
  type SetsFilterField,
} from './setsFilter'

export type FilterToken = {
  key: string
  label: string
  field: SetsFilterField
  apply?: (filter: SetsFilter) => SetsFilter
}

const textFields = ['search', 'characterName', 'setId', 'minifigId'] as const
const booleanFields = ['owned', 'retired'] as const
const pickerFields = ['tags', 'timeline'] as const

const isMatch = ({ label, text }: { label: string; text: string }) =>
  !text || label.toLowerCase().includes(text.trim().toLowerCase())

export const getTokenSuggestions = ({
  pendingField,
  subthemeOptions,
  text,
}: {
  pendingField?: SetsFilterField
  subthemeOptions: string[]
  text: string
}): FilterToken[] => {
  const isWanted = (field: SetsFilterField) =>
    !pendingField || pendingField === field
  const value = text.trim()

  const textTokens: FilterToken[] = value
    ? textFields.filter(isWanted).map((field) => ({
        key: `${field}-${value}`,
        label:
          field === 'search'
            ? `Name or ID contains “${value}”`
            : `${getFieldLabel(field)} contains “${value}”`,
        field,
        apply: (filter) => ({ ...filter, [field]: value }),
      }))
    : []

  const booleanTokens: FilterToken[] = booleanFields
    .filter(isWanted)
    .flatMap((field) =>
      [true, false].map((choice) => ({
        key: `${field}-${choice}`,
        label: `${getFieldLabel(field)}: ${choice ? 'Yes' : 'No'}`,
        field,
        apply: (filter: SetsFilter) => ({ ...filter, [field]: choice }),
      }))
    )
    .filter(
      ({ label }) => pendingField || isMatch({ label, text })
    )

  const subthemeTokens: FilterToken[] = isWanted('subthemes')
    ? subthemeOptions
        .filter((subtheme) =>
          isMatch({ label: `Subtheme ${subtheme}`, text })
        )
        .slice(0, 8)
        .map((subtheme) => ({
          key: `subtheme-${subtheme}`,
          label: `Subtheme: ${subtheme}`,
          field: 'subthemes',
          apply: (filter) => ({
            ...filter,
            subthemes: [...new Set([...filter.subthemes, subtheme])],
          }),
        }))
    : []

  const pickerTokens: FilterToken[] = pickerFields
    .filter(isWanted)
    .map((field) => ({
      key: `${field}-picker`,
      label: `${getFieldLabel(field)}…`,
      field,
    }))
    .filter(({ label }) => pendingField || isMatch({ label, text }))

  return [...textTokens, ...booleanTokens, ...subthemeTokens, ...pickerTokens]
}
