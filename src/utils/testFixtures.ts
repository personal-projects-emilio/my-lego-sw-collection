import type { Minifig } from 'types/minifigs'
import type { Set } from 'types/sets'

type SetMinifig = Set['content']['minifigs'][number]

export const setFixture = ({
  id,
  content,
  ...overrides
}: Omit<Partial<Set>, 'content'> & {
  id: Set['id']
  content?: Partial<Set['content']>
}): Set => ({
  bricksetImagePath: null,
  content: {
    bags: null,
    box: null,
    minifigs: [],
    notice: null,
    partsQuantity: null,
    ...content,
  },
  dimensions: {
    box: { depth: null, height: null, width: null },
    model: { depth: null, height: null, width: null },
  },
  EAN: null,
  exitDate: null,
  id,
  location: '',
  name: `Set ${id}`,
  note: '',
  ownedQuantity: 1,
  prices: {
    bought: 0,
    brickLinkSoldPriceNew: 0,
    brickLinkSoldPriceUsed: 0,
    marketValue: 0,
    storeValue: 0,
  },
  releaseYear: 2020,
  retired: false,
  subtheme: 'Subtheme',
  tags: [],
  timeline: [],
  UPC: null,
  ...overrides,
})

export const buildMinifigFixture = ({
  id,
  ...overrides
}: Partial<Minifig> & { id: Minifig['id'] }): Minifig => ({
  characterName: `Name ${id}`,
  id,
  name: `Minifig ${id}`,
  tags: [],
  timeline: [],
  ...overrides,
})

export const setMinifigFixture = ({
  id,
  ...overrides
}: Partial<SetMinifig> & { id: string }): SetMinifig => ({
  characterName: `Name ${id}`,
  id,
  isInFrame: false,
  quantity: 1,
  ...overrides,
})
