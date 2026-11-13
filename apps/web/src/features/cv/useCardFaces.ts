import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CvDocument } from '../../data/types'
import { cardDetails, cardModel, resolveCardStyle } from '../../domain/cardStyle'
import { resolveCvStyle } from '../../domain/cvStyle'
import { isMinor } from '../../domain/education'
import { publicUrl } from '../../domain/publicCard'
import { qrModules } from '../../lib/qr'
import { useUser } from '../../state/userStore'
import { layoutCard } from './cardLayout'
import { cvFontFamily, useCvMeasure } from './cvFonts'

/** A CV's business card, laid out: the editor and the list on the CV page draw the same faces. */
export function useCardFaces(document: CvDocument) {
  const { t } = useTranslation()
  const user = useUser()
  const { cv, card, template } = document
  // Minors have no public page and no QR: the options do not even appear (CLAUDE.md).
  const minor = !user.profile || isMinor(user.profile.birthYear)
  const model = cardModel(card)
  const style = useMemo(
    () => resolveCardStyle(resolveCvStyle(template, document.style), card),
    [template, document.style, card],
  )
  const details = useMemo(() => cardDetails(cv, card), [cv, card])
  const measure = useCvMeasure(style.font)
  const placeholder = t('cv.empty')
  const photo = user.photo
  const qr = useMemo(
    () => (!minor && user.publicPage ? qrModules(publicUrl(user.publicPage.slug)) : null),
    [minor, user.publicPage],
  )
  const faces = useMemo(
    () => layoutCard({ details, style, model, measure, placeholder, photo, qr }),
    [details, style, model, measure, placeholder, photo, qr],
  )
  return {
    minor,
    model,
    style,
    details,
    measure,
    placeholder,
    photo,
    qr,
    faces,
    family: cvFontFamily(style.font),
    source: { details, style, model, photo, qr },
  }
}
