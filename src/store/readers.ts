import fs from 'fs'
import path from 'path'
import { TwitterAccount } from './types'
import { validateMnemonic } from 'bip39'
import { shuffle } from 'helpers'
import { mnemonicToAccount } from 'viem/accounts'

export const credentialsFolderPath = './credentials/'

export const parseProxy = (line: string) => {
  if (line.includes('socks')) return null

  if (!line.includes('@') && line.split(':').length === 4) {
    const split = line.split(':')
    let url = `${split[2]}:${split[3]}@${split[0]}:${split[1]}`
    return url.startsWith('http') ? url : `http://${url}`
  }

  const url = line.trim()
  return url.startsWith('http') ? url : `http://${url}`
}

const fileExists = (filename: string): boolean => {
  try {
    fs.accessSync(path.join(credentialsFolderPath, filename))
    return true
  } catch (err) {
    return false
  }
}

export const filterEmptyStrings = (keyStrings: string[]): string[] => keyStrings.filter((keyString) => keyString.length > 0)
const i2hex = (i: any) => ('0' + i.toString(16)).slice(-2)

const filterValidSolanaKeys = (keyStrings: string[]): string[] => keyStrings.filter((key) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key) || validateMnemonic(key))

const filterValidKeys = (keyStrings: string[]): string[] =>
  keyStrings
    .map((keyString) => {
      if (/^(0x)?[0-9a-fA-F]{64}$/.test(keyString)) return keyString
      try {
        return '0x' + Array.from(mnemonicToAccount(keyString).getHdKey().privateKey!).map(i2hex).join('')
      } catch (e: any) {
        return ''
      }
    })
    .filter((key) => /^(0x)?[0-9a-fA-F]{64}$/.test(key))

const filterValidProxies = (proxyStrings: string[]): string[] => proxyStrings.map((line) => parseProxy(line)).filter(Boolean) as string[]

const filterValidTelegrams = (telegramStrings: string[]): string[] => telegramStrings.filter((line) => line.startsWith('query_id'))

// get discords tokens from array of strings
// MTI5MDYxMzYwOTgzNTI2NjA2MQ.Ga92rk.wjXeeTT17V2gl_miZ76lPH5s0EGYrAbMmlJB2I
const filterValidDiscords = (discordStrings: string[]): string[] =>
  discordStrings
    .map((str) => str.match(/[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g)) // Match tokens in each string
    .flat() // Flatten nested arrays
    .filter(Boolean) as string[]

const filterTwitterAccounts = (data: string[]): Record<string, TwitterAccount> => {
  const twitterAccounts: Record<string, TwitterAccount> = {}
  data.forEach((line) => {
    const delimeter = line.split(';').length > 1 ? ';' : ':'

    const username = line.split(delimeter)[0]
    const tokenMatches = line.match(/[a-fA-F0-9]{40}/)
    const csrfMatches = line.match(/[a-fA-F0-9]{160}/)

    const password = line.split(delimeter)[1]
    const auth_token = tokenMatches ? tokenMatches[0] : null
    const csrf = csrfMatches ? csrfMatches[0] : null
    const email = line.split(delimeter)[2]

    if (username.length > 5 && auth_token) twitterAccounts[username] = { username, password, email, auth_token, csrf }
  })
  return twitterAccounts
}

const createFileIfNotExists = (filename: string, exampleData: string) => {
  const exist = fileExists(filename)
  if (!exist) return fs.writeFileSync(path.join(credentialsFolderPath, filename), exampleData)
  return false
}

const defaultFilter = (data: string[]): string[] => data.filter((line) => line.length > 0)
export const readFile = <T>(filename: string, filterFunction: (data: string[]) => T = defaultFilter as (data: string[]) => T, exampleData: string = ''): T => {
  if (createFileIfNotExists(filename, exampleData)) return [] as T
  const fileContents = fs.readFileSync(path.join(credentialsFolderPath, filename), 'utf-8')
  const lines = [...new Set(fileContents.split('\n'))].map((i) => i.trim()).filter((i) => i.length > 0)
  return filterFunction(lines)
}

const readAccounts = <T>(filename: string, filterFunction: (data: string[]) => T, exampleData: string): T => {
  try {
    return readFile(filename, filterFunction, exampleData)
  } catch (err) {
    console.error(err)
    return {} as T
  }
}
const writeAccounts = <T>(filename: string, data: string[]): string[] => {
  try {
    fs.writeFileSync(path.join(credentialsFolderPath, filename), data.join('\n'))
    return data
  } catch (err) {
    console.error(err)
    return [] as string[]
  }
}

// Readers
const exampleTwitterAccount = 'exampleUsername;examplePassword;exampleEmail@example.com;exampleAuthToken'
export const readTwitterAccounts = (customEventFolder = '', filename = 'twitters.txt') =>
  Object.values(readAccounts<Record<string, TwitterAccount>>(customEventFolder + '/' + filename, filterTwitterAccounts, exampleTwitterAccount))

const exampleKey = ''
export const readKeys = (customEventFolder = '', filename = 'keys.txt') => {
  const keys = [...new Set(readAccounts<string[]>(customEventFolder + '/' + filename, filterValidKeys, exampleKey))]
  writeAccounts(customEventFolder + '/' + filename, keys)
  return keys as string[]
}

const exampleDiscord = 'discordToken'
export const readDiscords = (customEventFolder = '', filename = 'discords.txt') => {
  const discords = [...new Set(readAccounts<string[]>(customEventFolder + '/' + filename, filterValidDiscords, exampleDiscord))]
  writeAccounts(customEventFolder + '/' + filename, discords)
  return discords as string[]
}

const proxyExample = 'http://login:password@fast.travchisproxies.com:9090'
export const readProxies = (customEventFolder = '', filename = 'proxies.txt') => {
  const proxies = readAccounts<string[]>(customEventFolder + '/' + filename, filterValidProxies, proxyExample)
  writeAccounts(customEventFolder + '/' + filename, proxies)
  return proxies as string[]
}
export const randomProxy = () => shuffle(readProxies())[0]

const telegramExample = 'query_id=AAGVGAYAAAAAAJUYBgAHEQ62'
export const readTelegrams = (customEventFolder = '', filename = 'telegrams.txt') =>
  readAccounts<string[]>(customEventFolder + '/' + filename, filterValidTelegrams, telegramExample)

// Other
export const deleteTwitterAccount = (searchQuery: string, customEventFolder = '', filename = 'twitters.txt') => {
  // Read the existing Twitter accounts from the file
  const existingAccounts = readTwitterAccounts(customEventFolder, filename)

  // Check if the account with the provided username exists
  if (existingAccounts.find((account) => account.username === searchQuery || account.auth_token === searchQuery)) {
    // Filter out the account to be deleted
    const updatedAccounts = existingAccounts.filter((account) => account.username !== searchQuery && account.auth_token !== searchQuery)

    // Convert the updated accounts back to a string
    const updatedAccountsString = updatedAccounts
      .map((account) => `${account.username};${account.password};${account.email};${account.auth_token};${account.csrf}`)
      .join('\n')

    // Write the updated accounts back to the file
    fs.writeFileSync(path.join(credentialsFolderPath, filename), updatedAccountsString, 'utf-8')
    return searchQuery
  } else {
    console.log(`Twitter account with username '${searchQuery}' not found.`)
    return false
  }
}
