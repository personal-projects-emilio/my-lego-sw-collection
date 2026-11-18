export type SetIndividualMinifigProps = {
  id: string
  quantity: number
  characterName: string
  isInFrame: boolean
}

export const initialMinifigState = {
  id: '',
  quantity: 1,
  characterName: '',
  isInFrame: false,
} satisfies SetIndividualMinifigProps
