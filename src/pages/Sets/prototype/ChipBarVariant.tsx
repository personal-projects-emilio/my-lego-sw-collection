import { type FC, useEffect, useId, useRef, useState } from 'react'
import { MdAdd } from 'react-icons/md'

import { Button, Chip, Popover } from '@mui/material'
import { SearchField } from 'components/inputs'
import { makeStyles } from 'tss-react/mui'

import FieldEditor from './FieldEditor'
import {
  emptySetsFilter,
  type FilterVariantProps,
  formatFieldValue,
  getActiveFields,
  isFieldActive,
  type SetsFilterField,
  setsFilterFields,
} from './setsFilter'

const useChipBarStyles = makeStyles({ name: 'ChipBarVariant' })((theme) => ({
  bar: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
  },
  editor: { padding: theme.spacing(2), width: 360 },
}))

const chipFields = setsFilterFields.filter(({ field }) => field !== 'search')

const ChipBarVariant: FC<FilterVariantProps> = (props) => {
  const { filter, onChange, request } = props
  const { classes } = useChipBarStyles()
  const editorId = useId()
  const chipRefs = useRef<Partial<Record<SetsFilterField, HTMLDivElement>>>({})
  const [openField, setOpenField] = useState<SetsFilterField>()

  useEffect(() => {
    if (request && request.field !== 'search') setOpenField(request.field)
  }, [request])

  const activeCount = getActiveFields(filter).length

  return (
    <div className={classes.bar} role="search" aria-label="Filter sets">
      <SearchField
        value={filter.search}
        onChange={(search) => onChange({ ...filter, search })}
      />
      {chipFields.map(({ field, label }) => {
        const isActive = isFieldActive({ filter, field })
        return (
          <Chip
            key={field}
            ref={(element) => {
              if (element) chipRefs.current[field] = element
            }}
            aria-controls={openField === field ? editorId : undefined}
            aria-expanded={openField === field}
            aria-haspopup="dialog"
            color={isActive ? 'primary' : 'default'}
            icon={isActive ? undefined : <MdAdd />}
            label={
              isActive ? `${label}: ${formatFieldValue({ ...props, field })}` : label
            }
            onClick={() => setOpenField(field)}
            onDelete={
              isActive
                ? () => onChange({ ...filter, [field]: emptySetsFilter[field] })
                : undefined
            }
            variant={isActive ? 'filled' : 'outlined'}
          />
        )
      })}
      {activeCount > 0 && (
        <Button size="small" onClick={() => onChange(emptySetsFilter)}>
          Clear all ({activeCount})
        </Button>
      )}
      <Popover
        anchorEl={openField ? chipRefs.current[openField] : null}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={() => setOpenField(undefined)}
        open={!!openField}
        slotProps={{ paper: { id: editorId, role: 'dialog' } }}
      >
        {openField && (
          <div className={classes.editor}>
            <FieldEditor
              {...props}
              autoFocus
              field={openField}
              id={`${editorId}-${openField}`}
            />
          </div>
        )}
      </Popover>
    </div>
  )
}

export default ChipBarVariant
