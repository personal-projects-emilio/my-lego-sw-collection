import { isValidElement, type ReactElement, type ReactNode } from 'react'

export type OptionElement = ReactElement<{ 'data-depth': number }>

export const isOptionElement = (child: ReactNode): child is OptionElement =>
  isValidElement<{ 'data-depth'?: unknown }>(child) &&
  typeof child.props['data-depth'] === 'number'

const nestOptions = ({
  options,
  subtreeClassName,
}: {
  options: OptionElement[]
  subtreeClassName: string
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
          <ul className={subtreeClassName} role="presentation">
            {option}
            {nestOptions({
              options: options.slice(start + 1, end),
              subtreeClassName,
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
