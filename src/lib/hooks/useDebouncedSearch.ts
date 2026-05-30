import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Manages a search input with debounced URL/state commits.
 *
 * - The input value updates immediately on every keystroke (responsive UI).
 * - `onCommit` fires only after the user pauses typing for `delay` ms.
 * - When `externalValue` changes (e.g. "Clear filters" resets the URL), the input
 *   syncs via the React-approved derived-state-during-render pattern — no effects.
 * - The clear handler commits `undefined` instantly with no debounce.
 */
export function useDebouncedSearch(
  externalValue: string | undefined,
  onCommit: (value: string | undefined) => void,
  delay = 350,
) {
  const [inputValue, setInputValue] = useState(externalValue ?? '')

  // Derived state: sync local input when externalValue changes.
  // Calling setState conditionally during render is the React-recommended pattern
  // (see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  // React immediately re-renders with the new value — no effect, no cascade warning.
  const [prevExternal, setPrevExternal] = useState(externalValue)
  if (externalValue !== prevExternal) {
    setPrevExternal(externalValue)
    setInputValue(externalValue ?? '')
  }

  // Stable ref to the latest onCommit — updated after render (never during render).
  const commitRef = useRef(onCommit)
  // Ref to the latest externalValue for reading inside the setTimeout closure.
  const externalRef = useRef(externalValue)
  useLayoutEffect(() => {
    commitRef.current = onCommit
    externalRef.current = externalValue
  })

  // Debounce: fire onCommit only when inputValue differs from what's already in the URL.
  useEffect(() => {
    const timer = setTimeout(() => {
      const committed = externalRef.current ?? ''
      if (inputValue !== committed) {
        commitRef.current(inputValue || undefined)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [inputValue, delay])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setInputValue('')
    commitRef.current(undefined) // immediate — no debounce for explicit clear
  }, [])

  return { value: inputValue, onChange: handleChange, onClear: handleClear }
}
