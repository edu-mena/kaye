import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CheckboxField, SelectField, TextField } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PROVINCES } from '../../data/provinces'
import { EDUCATION_LEVELS, type EducationLevel } from '../../data/types'
import { isMinor } from '../../domain/education'
import { userActions, useUser } from '../../state/userStore'

const MIN_AGE = 14
const LEGAL_LINK = 'font-normal text-night underline underline-offset-2 hover:text-blue'
// Read once when the app loads: render must not depend on the clock.
const CURRENT_YEAR = new Date().getFullYear()
const OLDEST = 60

type Values = {
  name: string
  birthYear: string
  province: string
  education: string
  guardian: boolean
  terms: boolean
}
type Errors = Partial<Record<keyof Values, string>>

type ProfileFormProps = {
  onSaved: () => void
  /** Editing an existing profile (Perfil > Dados pessoais): no terms to accept again, and a way out. */
  onCancel?: () => void
}

export function ProfileForm({ onSaved, onCancel }: ProfileFormProps) {
  const { t } = useTranslation()
  const { profile } = useUser()
  const year = CURRENT_YEAR
  const [values, setValues] = useState<Values>({
    name: profile?.name ?? '',
    birthYear: profile ? String(profile.birthYear) : '',
    province: profile?.province ?? '',
    education: profile?.education ?? '',
    guardian: profile?.guardianInformed ?? false,
    terms: Boolean(profile),
  })
  const [errors, setErrors] = useState<Errors>({})
  const minor = values.birthYear !== '' && isMinor(Number(values.birthYear), year)

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  function submit(event: FormEvent) {
    event.preventDefault()
    const required = t('onboarding.required')
    const found: Errors = {}
    if (!values.name.trim()) found.name = required
    if (!values.birthYear) found.birthYear = required
    if (!values.province) found.province = required
    if (!values.education) found.education = required
    if (minor && !values.guardian) found.guardian = required
    if (!values.terms) found.terms = required
    setErrors(found)
    if (Object.keys(found).length > 0) return

    userActions.saveProfile({
      name: values.name.trim(),
      birthYear: Number(values.birthYear),
      province: values.province,
      education: values.education as EducationLevel,
      guardianInformed: minor && values.guardian,
    })
    onSaved()
  }

  const years = Array.from({ length: OLDEST - MIN_AGE + 1 }, (_, index) => String(year - MIN_AGE - index))

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      <TextField
        label={t('onboarding.name')}
        placeholder={t('onboarding.namePlaceholder')}
        autoComplete="given-name"
        maxLength={40}
        value={values.name}
        error={errors.name}
        onChange={(event) => set('name', event.target.value)}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label={t('onboarding.birthYear')}
          placeholder={t('common.select')}
          options={years.map((value) => ({ value, label: value }))}
          value={values.birthYear}
          error={errors.birthYear}
          onChange={(event) => set('birthYear', event.target.value)}
        />
        <SelectField
          label={t('onboarding.province')}
          placeholder={t('common.select')}
          options={PROVINCES.map((value) => ({ value, label: value }))}
          value={values.province}
          error={errors.province}
          onChange={(event) => set('province', event.target.value)}
        />
      </div>
      <SelectField
        label={t('onboarding.education')}
        placeholder={t('common.select')}
        options={EDUCATION_LEVELS.map((value) => ({ value, label: t(`education.${value}`) }))}
        value={values.education}
        error={errors.education}
        onChange={(event) => set('education', event.target.value)}
      />

      {minor && (
        <Card tone="notice" className="space-y-3">
          <p className="text-base font-semibold">{t('onboarding.minorTitle')}</p>
          <p className="text-sm font-light text-copy">{t('onboarding.minorBody')}</p>
          <CheckboxField
            label={t('onboarding.guardian')}
            checked={values.guardian}
            error={errors.guardian}
            onChange={(event) => set('guardian', event.target.checked)}
          />
        </Card>
      )}

      {!onCancel && (
        <div>
          <CheckboxField
            label={t('onboarding.terms')}
            checked={values.terms}
            error={errors.terms}
            onChange={(event) => set('terms', event.target.checked)}
          />
          {/* Outside the label, so the links do not become part of the checkbox's name. A new
              tab keeps what was already filled in here. */}
          <p className="mt-1 pl-8 text-xs font-light text-muted">
            {t('onboarding.termsRead')}{' '}
            <Link to="/termos" target="_blank" className={LEGAL_LINK}>
              {t('legal.terms')}
            </Link>
            {' · '}
            <Link to="/privacidade" target="_blank" className={LEGAL_LINK}>
              {t('legal.privacy')}
            </Link>
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          {onCancel ? t('common.save') : t('common.continue')}
        </Button>
        {onCancel && (
          <Button variant="ghost" size="lg" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  )
}
