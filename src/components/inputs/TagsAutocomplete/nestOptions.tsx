import { cloneElement, type ReactElement, type ReactNode } from 'react'

type NestClasses = Record<'nestedList' | 'pinned', string>

export type OptionElement = ReactElement<{
  className?: string
  'data-depth': number
}>

const nestOptions = ({
  options,
  classes,
  cx,
}: {
  options: OptionElement[]
  classes: NestClasses
  cx: (...names: Array<string | undefined>) => string
}): ReactNode[] => {
  const nested: ReactNode[] = []
  for (let start = 0; start < options.length;) {
    const option = options[start]
    const depth = option.props['data-depth']
    let end = start + 1
    while (end < options.length && options[end].props['data-depth'] > depth)
      end++
    nested.push(
      end === start + 1 ? (
        option
      ) : (
        <li key={`subtree-${option.key}`} role="presentation">
          <ul className={classes.nestedList} role="presentation">
            {cloneElement(option, {
              className: cx(option.props.className, classes.pinned),
            })}
            {nestOptions({
              options: options.slice(start + 1, end),
              classes,
              cx,
            })}
          </ul>
        </li>
      )
    )
    start = end
  }
  return nested
}

export default nestOptions
