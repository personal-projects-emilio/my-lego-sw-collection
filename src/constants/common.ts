import type { Item, ItemId } from 'types/common'

export const mapItemToImageProps = {
  minifig: (id) =>
    ({
      alt: `minifig ${String(id)} bricklink picture`,
      src: `https://img.bricklink.com/ItemImage/MN/0/${String(id)}.png`,
    }) as const,
  set: (id) =>
    ({
      alt: `set ${String(id)} bricklink picture`,
      // BrickLink set numbers always carry a variant; ours only do when there are several
      src: `https://img.bricklink.com/ItemImage/SN/0/${/-\d+$/.test(String(id)) ? String(id) : `${String(id)}-1`}.png`,
    }) as const,
} as const satisfies Record<
  Item,
  (id: ItemId) => {
    alt: string
    src: string
  }
>
