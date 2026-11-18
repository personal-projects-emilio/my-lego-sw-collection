import { useCallback, useMemo } from 'react'

import { queryKeys } from 'api/api.constants'
import {
  mutateTimeline,
  setTimelineQueryData,
  useTimelineQuery,
} from 'api/timeline'
import useVocabularyMutations from 'hooks/useVocabularyMutations'
import type { TimelineState } from 'utils/timeline'

const useTimelineMutations = () => {
  const { data: timelineList } = useTimelineQuery()
  const { state, apply, isPending } = useVocabularyMutations({
    key: queryKeys.timeline,
    list: timelineList,
    setQueryData: setTimelineQueryData,
    save: mutateTimeline,
  })

  const timelineState = useMemo(
    (): TimelineState | undefined =>
      state && {
        timelineList: state.list,
        setsList: state.setsList,
        minifigsList: state.minifigsList,
      },
    [state]
  )

  const applyTimelineState = useCallback(
    ({ timelineList: list, setsList, minifigsList }: TimelineState) =>
      apply({ list, setsList, minifigsList }),
    [apply]
  )

  return { state: timelineState, applyTimelineState, isPending }
}

export default useTimelineMutations
