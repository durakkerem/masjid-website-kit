import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * The signed-in user's role, or undefined. Only documents from the `users`
 * collection carry a role; anything else that can authenticate (such as an
 * MCP API-key document used directly against the REST API) gets no role and
 * therefore no elevated access.
 */
const roleOf = (user: PayloadRequest['user']): string | undefined =>
  user && 'role' in user ? (user.role ?? undefined) : undefined

/** Admins and committee editors: the people who may edit site content. */
export const canEditContent = (user: PayloadRequest['user']): boolean => {
  const role = roleOf(user)
  return role === 'admin' || role === 'committee_editor'
}

export const isAdmin: Access = ({ req: { user } }) => roleOf(user) === 'admin'

export const isAdminOrCommitteeEditor: Access = ({ req: { user } }) => {
  const role = roleOf(user)
  return role === 'admin' || role === 'committee_editor'
}

export const isAdminField: FieldAccess = ({ req: { user } }) => roleOf(user) === 'admin'

export const publicRead: Access = () => true
