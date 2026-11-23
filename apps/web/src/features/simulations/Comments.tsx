import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { TextAreaField } from '../../components/ui/Field'
import { ACCOUNTS } from '../../data/account'
import {
  deleteComment,
  listComments,
  MAX_COMMENT,
  myComments,
  postComment,
  reportComment,
  type CommentItem,
  type CommentSubject,
} from '../../data/comments'
import { ApiError } from '../../lib/api'
import { needsAccount } from '../../state/accountGate'
import { useUser } from '../../state/userStore'

type Props = { type: CommentSubject; id: string }

/**
 * What people say about a simulation, a piece of news or a company. Comments live on the server (accounts), so the
 * demo site shows nothing here. Writing asks for an account; the server filters, hides after three reports and
 * shows only the first name of minors.
 */
export function Comments(props: Props) {
  return ACCOUNTS ? <CommentsList {...props} /> : null
}

function CommentsList({ type, id }: Props) {
  const { t, i18n } = useTranslation()
  const { profile } = useUser()
  const client = useQueryClient()
  const key = ['comments', type, id]
  const list = useQuery({ queryKey: key, queryFn: () => listComments(type, id) })
  const mine = useQuery({ queryKey: ['comments', 'mine'], queryFn: myComments, enabled: profile !== null })
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState<'refused' | 'failed' | 'reported' | null>(null)

  const send = useMutation({
    mutationFn: () => postComment(type, id, body),
    onSuccess: (comment) => {
      setBody('')
      setNotice(null)
      client.setQueryData<CommentItem[]>(key, (current = []) => [comment, ...current])
      client.setQueryData<number[]>(['comments', 'mine'], (current = []) => [...current, comment.id])
    },
    onError: (error) => setNotice(error instanceof ApiError && error.status === 422 ? 'refused' : 'failed'),
  })
  const report = useMutation({
    mutationFn: reportComment,
    onSuccess: () => setNotice('reported'),
    onError: () => setNotice('failed'),
  })
  const remove = useMutation({
    mutationFn: deleteComment,
    onSuccess: (_none, commentId) =>
      client.setQueryData<CommentItem[]>(key, (current = []) =>
        current.filter((item) => item.id !== commentId),
      ),
    onError: () => setNotice('failed'),
  })

  const submit = needsAccount(() => send.mutate())
  const onSubmit = (event: SyntheticEvent) => {
    event.preventDefault()
    if (body.trim().length > 0) submit()
  }
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
  const comments = list.data ?? []

  return (
    <section aria-labelledby={`comments-${id}`} className="mt-8">
      <h2 id={`comments-${id}`} className="flex items-center gap-2 text-lg font-semibold text-night">
        <Icon name="message" className="size-5" />
        {t('simulations.comments.title')}
      </h2>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <TextAreaField
          label={t('simulations.comments.label')}
          hint={t('simulations.comments.hint', { max: MAX_COMMENT })}
          value={body}
          maxLength={MAX_COMMENT}
          onChange={(event) => setBody(event.target.value)}
        />
        <Button type="submit" size="sm" disabled={send.isPending || body.trim().length === 0}>
          {t('simulations.comments.send')}
        </Button>
      </form>
      {notice && (
        <output className="mt-3 block text-sm font-light text-copy">
          {t(`simulations.comments.${notice}`)}
        </output>
      )}
      {list.isError ? (
        <p className="mt-4 text-sm font-light text-muted">{t('simulations.comments.loadFailed')}</p>
      ) : comments.length === 0 ? (
        !list.isPending && (
          <p className="mt-4 text-sm font-light text-muted">{t('simulations.comments.empty')}</p>
        )
      ) : (
        <ul className="mt-4 space-y-3">
          {comments.map((comment) => (
            <li key={comment.id}>
              <Card tone="gray" className="p-4">
                <p className="text-sm font-semibold text-night">
                  {comment.author}
                  <span className="ml-2 text-xs font-light text-muted">
                    {date.format(new Date(comment.at))}
                  </span>
                </p>
                <p className="mt-1 text-sm font-light whitespace-pre-line text-copy">{comment.body}</p>
                <div className="mt-2 flex gap-3 text-xs">
                  {(mine.data ?? []).includes(comment.id) ? (
                    <button
                      type="button"
                      onClick={() => remove.mutate(comment.id)}
                      className="font-normal text-night underline underline-offset-2"
                    >
                      {t('simulations.comments.delete')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={needsAccount(() => report.mutate(comment.id))}
                      className="font-normal text-night underline underline-offset-2"
                    >
                      {t('simulations.comments.report')}
                    </button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
