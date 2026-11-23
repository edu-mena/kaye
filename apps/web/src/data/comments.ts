import { api } from '../lib/api'

// Comments on the Laravel API (docs/arquitetura.md, section 6): reading is public, writing, reporting and deleting
// need an account. They live on the server only, so the demo site (no accounts) never shows them.

export type CommentSubject = 'news' | 'company' | 'simulation'

export type CommentItem = {
  id: number
  type: CommentSubject
  subject: string
  /** The name; only the first one for minors. */
  author: string
  body: string
  /** ISO date-time. */
  at: string
}

export const MAX_COMMENT = 500

export const listComments = (type: CommentSubject, id: string) =>
  api<CommentItem[]>(`/comments?type=${type}&id=${encodeURIComponent(id)}`)

export const postComment = (type: CommentSubject, id: string, body: string) =>
  api<CommentItem>('/comments', { method: 'POST', body: JSON.stringify({ type, id, body }) })

export const reportComment = (id: number) => api<{ ok: true }>(`/comments/${id}/report`, { method: 'POST' })

export const deleteComment = (id: number) => api<void>(`/comments/${id}`, { method: 'DELETE' })

/** The ids of the person's own comments, so the app shows "Apagar" on them. */
export const myComments = () => api<number[]>('/me/comments')
