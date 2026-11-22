import { createElement, type FC } from 'react'
import {
  MdCategory,
  MdMenuBook,
  MdMovie,
  MdSportsEsports,
  MdTv,
} from 'react-icons/md'

import type { Kind } from 'types/timeline'
import { getKindName } from 'utils/timeline'

const mapKindsToIcons = {
  movie: MdMovie,
  show: MdTv,
  game: MdSportsEsports,
  book: MdMenuBook,
  other: MdCategory,
}

const KindIcon: FC<{ kind?: Kind; className?: string }> = ({
  kind,
  className,
}) =>
  kind
    ? createElement(mapKindsToIcons[kind], {
        className,
        role: 'img',
        'aria-label': getKindName(kind),
      })
    : null

export default KindIcon
