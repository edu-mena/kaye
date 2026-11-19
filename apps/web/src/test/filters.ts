import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * The field of a list filter (components/ui/Filters.tsx): a select when it has few options, a box to type in
 * (searchbox) when it has many.
 */
async function filterField(name: string | RegExp): Promise<HTMLElement> {
  return waitFor(() => {
    const field = screen.queryByRole('combobox', { name }) ?? screen.queryByRole('searchbox', { name })
    if (!field) throw new Error(`No filter named ${String(name)}`)
    return field
  })
}

/** Picks an option of a list filter by its label, in either kind of field. */
export async function pickFilter(name: string | RegExp, option: string): Promise<void> {
  const field = await filterField(name)
  if (field instanceof HTMLSelectElement) {
    await userEvent.selectOptions(field, option)
    return
  }
  await userEvent.click(field)
  // The label is the button's first text; a hint may follow it in its own element.
  const buttons = within(screen.getByRole('list', { name })).getAllByRole('button')
  const button = buttons.find((item) => item.firstChild?.textContent === option)
  if (!button) throw new Error(`No option ${option} in the filter ${String(name)}`)
  await userEvent.click(button)
}

/** Clears a filter that has a value: a select back to its placeholder, a box with its clear button. */
export async function clearFilter(name: string): Promise<void> {
  const select = screen.queryByRole('combobox', { name })
  if (select instanceof HTMLSelectElement) {
    await userEvent.selectOptions(select, '')
    return
  }
  await userEvent.click(screen.getByRole('button', { name: new RegExp(`${escape(name)}$`) }))
}

const escape = (text: string) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')
