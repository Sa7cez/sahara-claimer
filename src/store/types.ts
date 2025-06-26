export type TwitterAccount = {
  username: string
  password: string | undefined | null
  email: string | undefined | null
  auth_token: string
  csrf?: string | undefined | null
}
