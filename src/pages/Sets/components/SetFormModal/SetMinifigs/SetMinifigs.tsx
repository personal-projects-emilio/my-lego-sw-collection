import { forwardRef, useEffect, useMemo, useState } from 'react'
import {
  MdAddCircleOutline,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdEdit,
} from 'react-icons/md'

import { Chip, IconButton, Tooltip, Typography } from '@mui/material'
import type { SetFormInput } from 'types/sets'

import SetMinifigDialog from './SetMinifigDialog'
import {
  initialMinifigState,
  type SetIndividualMinifigProps,
} from './SetMinifigs.constant'
import useSetMinifigsStyles from './SetMinifigs.styles'

type SetMinifigsProps = {
  value: SetFormInput['content']['minifigs']
  onChange: (value: SetFormInput['content']['minifigs']) => void
  className: HTMLElement['className']
}

export const SetMinifigs = forwardRef<HTMLDivElement, SetMinifigsProps>(
  ({ value = [], onChange, className }, ref) => {
    const { classes, cx } = useSetMinifigsStyles()
    const [dialogMinifig, setDialogMinifig] =
      useState<SetIndividualMinifigProps | null>(null)

    const [values, setValues] = useState<SetIndividualMinifigProps[]>(
      value
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((el) => ({ ...el, isInFrame: el.isInFrame ?? false }))
    )

    const totalNumberOfMinifigs = useMemo(() => {
      return values.reduce((total, { quantity }) => {
        return total + Number(quantity)
      }, 0)
    }, [values])

    useEffect(() => {
      onChange?.(values)
    }, [values, onChange])

    const onSave = (data: SetIndividualMinifigProps) => {
      const minifigEditId = dialogMinifig?.id
      setValues((prevValues) => {
        const newValues = [...prevValues, data].sort((a, b) =>
          a.id.localeCompare(b.id)
        )
        if (!minifigEditId) return newValues
        if (minifigEditId === data.id)
          return prevValues.map((el) => (el.id === minifigEditId ? data : el))

        return newValues.filter((value) => value.id !== minifigEditId)
      })
    }

    return (
      <div className={cx(className, classes.container)} ref={ref}>
        <Typography>{`Minifigs${totalNumberOfMinifigs ? ` (${totalNumberOfMinifigs})` : ''}:`}</Typography>
        {values.map((minifig, minifigIndex) => (
          <div
            key={`set-minifig-${minifig.id}`}
            className={classes.minifigElement}
          >
            <span
              className={classes.span2}
            >{`${minifig.id} (x${minifig.quantity})`}</span>
            <span className={classes.span2}>{minifig.characterName}</span>

            <Chip
              variant="outlined"
              className={classes.span2}
              icon={
                minifig.isInFrame ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />
              }
              label="In frame"
            />
            <IconButton
              className={classes.span1}
              size="small"
              onClick={() => setDialogMinifig(minifig)}
              aria-label={`Edit ${minifig.id} from this set`}
            >
              <MdEdit />
            </IconButton>
            <IconButton
              className={classes.span1}
              size="small"
              aria-label={`Delete ${minifig.id} from this set`}
              onClick={() => {
                setValues((preValues) =>
                  preValues.filter((_, i) => i !== minifigIndex)
                )
              }}
            >
              <MdDelete />
            </IconButton>
          </div>
        ))}
        <Tooltip title="Add minifigs to this set">
          <IconButton
            onClick={() => setDialogMinifig(initialMinifigState)}
            color="primary"
          >
            <MdAddCircleOutline />
          </IconButton>
        </Tooltip>
        {dialogMinifig && (
          <SetMinifigDialog
            minifig={dialogMinifig}
            onClose={() => setDialogMinifig(null)}
            onSave={onSave}
            takenIds={values.map(({ id }) => id)}
          />
        )}
      </div>
    )
  }
)

export default SetMinifigs
