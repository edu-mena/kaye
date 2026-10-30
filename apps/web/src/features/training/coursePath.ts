/** The link to a real course's page; `academy` opens it on that institution's offer. */
export const coursePath = (id: string, academy?: string) =>
  `/cursos/curso/${id}${academy ? `?academia=${academy}` : ''}`
