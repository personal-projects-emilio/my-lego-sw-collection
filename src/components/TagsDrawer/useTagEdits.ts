import { useCallback, useState } from 'react'

import useVocabularyMutations from 'hooks/useVocabularyMutations'
import { isEqual } from 'lodash'
import { type TagsState, undoTagEdit } from 'utils/tags'

import { type Run, saveError } from './tagTree'

type HistoryEntry = { description: string; before: TagsState; after: TagsState }

const useTagEdits = () => {
  const { state, apply, isPending } = useVocabularyMutations('tags')
  const [error, setError] = useState<string>()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const lastEdit = history[history.length - 1]

  const run: Run = useCallback(
    (edit, description) => {
      if (!edit || !state) return
      if ('refused' in edit) {
        setError(edit.refused)
        return
      }
      if (isPending) {
        setError('Wait for the previous change to be saved')
        return
      }
      setError(undefined)
      if (
        edit.state.setsList === state.setsList &&
        edit.state.minifigsList === state.minifigsList &&
        isEqual(edit.state.tagsList, state.tagsList)
      )
        return
      const before = state
      apply(edit.state)
        .then(() =>
          setHistory((entries) => [
            ...entries,
            { description, before, after: edit.state },
          ])
        )
        .catch((cause) =>
          setError(saveError('The change could not be saved')(cause))
        )
    },
    [state, isPending, apply]
  )

  const undo = () => {
    if (!state || !lastEdit || isPending) return
    setError(undefined)
    apply(undoTagEdit({ current: state, ...lastEdit }))
      .then(() => setHistory((entries) => entries.slice(0, -1)))
      .catch((cause) =>
        setError(saveError('The undo could not be saved')(cause))
      )
  }

  return { state, isPending, error, setError, run, lastEdit, undo }
}

export default useTagEdits
