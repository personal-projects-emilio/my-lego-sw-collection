import { forwardRef, useEffect, useMemo, useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import {
  MdAddCircleOutline,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdEdit,
} from 'react-icons/md'

import { LoadingButton } from '@mui/lab'
import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useMinifigsQuery } from 'api/minifigs'
import { Autocomplete, Checkbox } from 'components/inputs'
import { useMinifigsAutocompleteOptions } from 'pages/Minifigs/hooks'
import type { Set } from 'types/sets'

import useStyles from './SetMinifigs.styles'

type SetMinifigsProps = {
  value: Set['content']['minifigs']
  onChange: (value: Set['content']['minifigs']) => void
  className: HTMLElement['className']
}

type SetIndividualMinifigProps = {
  id: string
  quantity: number
  characterName: string
  isInFrame: boolean
}
const initialMinifigState = {
  id: '',
  quantity: 1,
  characterName: '',
  isInFrame: false,
} satisfies SetIndividualMinifigProps

export const SetMinifigs = forwardRef<HTMLDivElement, SetMinifigsProps>(
  ({ value, onChange, className }, ref) => {
    const { data: minifigsList, isLoading } = useMinifigsQuery()
    const { classes, cx } = useStyles()
    const [dialogIsOpen, toggleDialogIsOpen] = useState(false)
    const [minifigEditId, setMinifigEditId] = useState<null | string>(null)
    const { ids } = useMinifigsAutocompleteOptions()

    const [values, setValues] = useState<SetIndividualMinifigProps[]>(
      value.sort((a, b) => a.id.localeCompare(b.id))
    )

    const totalNumberOfMinifigs = useMemo(() => {
      return values.reduce((total, { quantity }) => {
        return total + Number(quantity)
      }, 0)
    }, [values])

    useEffect(() => {
      onChange?.(values)
    }, [values, onChange])

    const { control, setValue, reset, handleSubmit } =
      useForm<SetIndividualMinifigProps>({
        defaultValues: initialMinifigState,
        mode: 'all',
      })

    const onSubmit: SubmitHandler<SetIndividualMinifigProps> = (data) => {
      setValues((prevValues) => {
        const newValues = [...prevValues, data].sort((a, b) =>
          a.id.localeCompare(b.id)
        )
        if (!minifigEditId) return newValues
        if (minifigEditId === data.id)
          return prevValues.map((el) => (el.id === minifigEditId ? data : el))

        return newValues.filter((value) => value.id !== minifigEditId)
      })
      handleClose()
    }

    const handleClose = () => {
      toggleDialogIsOpen(false)
      reset(initialMinifigState)
      setMinifigEditId(null)
    }

    const handleEditMinifig = (minifig: SetIndividualMinifigProps) => {
      toggleDialogIsOpen(true)
      reset(minifig)
      setMinifigEditId(minifig.id)
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
              onClick={() => {
                handleEditMinifig(minifig)
              }}
              arial-label={`Edit ${minifig.id} from this set`}
            >
              <MdEdit />
            </IconButton>
            <IconButton
              className={classes.span1}
              size="small"
              arial-label={`Delete ${minifig.id} from this set`}
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
          <IconButton onClick={() => toggleDialogIsOpen(true)} color="primary">
            <MdAddCircleOutline />
          </IconButton>
        </Tooltip>
        <Dialog
          aria-labelledby="set-minifig-edition"
          disableRestoreFocus
          onClose={handleClose}
          open={dialogIsOpen}
        >
          <form
            onSubmit={(e) => {
              e.stopPropagation()
              return handleSubmit(onSubmit)(e)
            }}
          >
            <DialogTitle id="set-minifig-edition">{`${
              minifigEditId
                ? `Edit ${minifigEditId} from this set`
                : 'Add a minifig to this set'
            }`}</DialogTitle>
            <DialogContent className={classes.dialogContent}>
              <Controller
                name="id"
                control={control}
                rules={{
                  required: 'This field is required',
                  validate: (value) => {
                    if (minifigEditId) return true
                    if (values.map(({ id }) => id).includes(value)) {
                      return 'This minifig is already in the list'
                    }
                    return true
                  },
                }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    {...field}
                    options={ids}
                    textFieldProps={{
                      autoFocus: !minifigEditId,
                      error: fieldState.invalid,
                      helperText: fieldState.error?.message,
                      label: 'Minifig id',
                      placeholder: 'Minifig id (ex: sw0001)',
                      required: true,
                    }}
                    onChange={(newValue) => {
                      field.onChange(newValue)
                      setValue(
                        'characterName',
                        minifigsList?.find((el) => el.id === newValue)
                          ?.characterName ?? ''
                      )
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="characterName"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    error={fieldState.invalid}
                    helperText={fieldState.error?.message}
                    label="Character name"
                    slotProps={{ input: { readOnly: true } }}
                  />
                )}
              />
              <Controller
                name="quantity"
                control={control}
                rules={{
                  required: 'This field is required',
                }}
                render={({ field, fieldState }) => {
                  return (
                    <TextField
                      {...field}
                      label="Quantity"
                      type="number"
                      onChange={(event) =>
                        field?.onChange?.(parseInt(event.target.value, 10))
                      }
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                      required
                    />
                  )
                }}
              />
              <Controller
                name="isInFrame"
                control={control}
                render={({ field }) => {
                  return <Checkbox {...field} label="At least one in frame" />
                }}
              />
            </DialogContent>
            <DialogActions>
              <LoadingButton
                onClick={handleClose}
                color="primary"
                loading={isLoading}
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                type="submit"
                color="primary"
                variant="contained"
                loading={isLoading}
              >
                {minifigEditId ? 'Edit' : 'Add'}
              </LoadingButton>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    )
  }
)

export default SetMinifigs
