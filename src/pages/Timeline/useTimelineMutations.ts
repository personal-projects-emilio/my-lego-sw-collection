import { queryKeys } from 'api/api.constants'
import {
  mutateTimeline,
  setTimelineQueryData,
  useTimelineQuery,
} from 'api/timeline'
import useVocabularyMutations from 'hooks/useVocabularyMutations'

const useTimelineMutations = () =>
  useVocabularyMutations({
    key: queryKeys.timeline,
    listKey: 'timelineList',
    list: useTimelineQuery().data,
    setQueryData: setTimelineQueryData,
    save: mutateTimeline,
  })

export default useTimelineMutations
