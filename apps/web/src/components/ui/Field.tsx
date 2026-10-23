import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

const CONTROL =
  'mt-1.5 block w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-navy placeholder:text-muted/70 focus:border-navy focus:outline-none aria-[invalid=true]:border-coral'

type FieldShell = { label: string; error?: string | null; hint?: string }

/** What every control needs to be named by its label and described by its message. */
type ControlA11y = { id: string; 'aria-invalid': boolean; 'aria-describedby': string | undefined }

function FieldMessage({ id, error, hint }: { id: string; error?: string | null; hint?: string }) {
  if (error) {
    return (
      <p id={id} className="mt-1 text-sm font-medium text-coral">
        {error}
      </p>
    )
  }
  return hint ? (
    <p id={id} className="mt-1 text-sm text-muted">
      {hint}
    </p>
  ) : null
}

/** Label, control and message, wired together; each field only brings its control. */
function Field({
  label,
  error,
  hint,
  className,
  renderControl,
}: FieldShell & { className: string; renderControl: (a11y: ControlA11y) => ReactNode }) {
  const id = useId()
  const messageId = `${id}-msg`
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      {renderControl({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error || hint ? messageId : undefined,
      })}
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  )
}

export function TextField({
  label,
  error,
  hint,
  className = '',
  ...props
}: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field
      label={label}
      error={error}
      hint={hint}
      className={className}
      renderControl={(a11y) => <input {...a11y} className={CONTROL} {...props} />}
    />
  )
}

export function TextAreaField({
  label,
  error,
  hint,
  className = '',
  ...props
}: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field
      label={label}
      error={error}
      hint={hint}
      className={className}
      renderControl={(a11y) => <textarea {...a11y} rows={3} className={CONTROL} {...props} />}
    />
  )
}

type SelectFieldProps = FieldShell &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: { value: string; label: string }[]
    placeholder: string
  }

export function SelectField({
  label,
  error,
  hint,
  options,
  placeholder,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <Field
      label={label}
      error={error}
      hint={hint}
      className={className}
      renderControl={(a11y) => (
        <select {...a11y} className={`${CONTROL} appearance-none`} {...props}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    />
  )
}

type CheckboxFieldProps = { label: ReactNode; error?: string | null } & InputHTMLAttributes<HTMLInputElement>

export function CheckboxField({ label, error, ...props }: CheckboxFieldProps) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 text-sm text-navy">
        <input
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-msg` : undefined}
          className="mt-0.5 size-5 shrink-0 accent-navy"
          {...props}
        />
        <span>{label}</span>
      </label>
      <FieldMessage id={`${id}-msg`} error={error} />
    </div>
  )
}
