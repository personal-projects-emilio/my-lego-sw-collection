export const listValueFormatter = (value: string[] | undefined) =>
  value?.join(', ') ?? ''
