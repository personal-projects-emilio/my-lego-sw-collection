import { createElement, type FC } from 'react'
import {
  MdCategory,
  MdMenuBook,
  MdMovie,
  MdSportsEsports,
  MdTv,
} from 'react-icons/md'

import type { Kind } from 'types/timeline'
import { kindName } from 'utils/timeline'

const kindIcons = {
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
    ? createElement(kindIcons[kind], {
        className,
        role: 'img',
        'aria-label': kindName(kind),
      })
    : null

export default KindIcon
