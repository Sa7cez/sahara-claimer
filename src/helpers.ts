import { log } from 'console'
import { gotScraping } from 'got-scraping'
import c from 'chalk'
import { Address, checksumAddress, Hex, isAddressEqual } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'

// Typography
export const fixed = (name: string | number, len = 25, direction: 'left' | 'right' | 'center' = 'right') => {
  name = String(name).slice(0, len)
  const left = len - name.length + 1
  const line =
    direction === 'left'
      ? name + ' '.repeat(left)
      : direction === 'right'
      ? ' '.repeat(left) + name
      : ' '.repeat(Math.floor(left / 2)) + name + ' '.repeat(Math.ceil(left / 2))

  return line.slice(0, len)
}

// Colors
export const createHexByUsername = (username: string) => {
  // Create a more diverse set of hex colors based on the username
  const hash = [...username].reduce((acc, cur) => acc + cur.charCodeAt(0), 0)
  const h = hash % 360
  const s = 70 + (hash % 30) * 2
  const l = 30 + (hash % 80) * 2

  const a = (s * Math.min(l, 100 - l)) / 100
  const b = l / 50 - 1
  const r = Math.round(255 * (l + a * b * Math.cos((h * Math.PI) / 180)))
  const g = Math.round(255 * (l + a * (1 - Math.abs(b - Math.cos(((h * 60 + 120) * Math.PI) / 180)))))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export const hex = (id: string) => {
  let prefix

  if (id.startsWith('0x')) prefix = c.hex('#' + id.slice(-6))(id)
  else {
    try {
      prefix = c.hex(createHexByUsername(id))(id)
    } catch (e) {
      prefix = c.hex('#000000')(id)
    }
    const len = 48 - id.length
    prefix = ' '.repeat(len > 0 ? len : 0) + prefix
  }

  return prefix
}

// Network
export const getIpEndpoints = [
  'https://api.ipify.org?format=json', // only ip
  'https://ifconfig.me/all.json', // ip and headers
  'https://tls.peet.ws/api/all', // large output
  'https://wtfismyip.com/json' // with location
]

export const checkIp = async (proxyUrl: string | undefined, endpoints = getIpEndpoints, retry = 1): Promise<string | false> => {
  const checker = choice(endpoints)
  // log('start checking ip...', proxyUrl)
  return axios
    .get(checker, {
      httpAgent: new HttpsProxyAgent(proxyUrl as string),
      httpsAgent: new HttpsProxyAgent(proxyUrl as string)
    })
    .then((response: any) => {
      // log(response.data)
      return response.data.ip || response.data.ip_addr || response.data.YourFuckingIPAddress
    })
    .catch((e: any) => {
      log(c.red('failed to check ip'), e.message)
      return false
    })
}

// Telegram
export const notify = async (message: string, to = process.env.ADMIN, mode = 'Markdown', url?: string) => {
  !process.env.ADMIN || !process.env.TOKEN
    ? false
    : gotScraping
        .post('https://api.telegram.org/bot' + process.env.TOKEN + '/sendMessage', {
          json: {
            chat_id: to,
            text: message,
            parse_mode: mode,
            disable_web_page_preview: true,
            ...(url
              ? {
                  reply_markup: {
                    inline_keyboard: [[{ text: 'Open in browser', url: url }]]
                  }
                }
              : {})
          }
        })
        .catch((e: any) => {
          log(e.error)
          log(message.replace('*', ''))
        })
}

// Randoms
export const randomInt = (value: number) => Math.floor(Math.random() * value)

export const randomRange = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const randomInRange = (min: string | number, max: string | number, decimalPlaces: number) => {
  let rand = Math.random() * (+max - +min) + +min
  let power = Math.pow(10, decimalPlaces)
  return Math.floor(rand * power) / power
}

export const randomId = (length = 17, charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') =>
  Array.from({ length: length }, () => {
    let index = Math.floor(Math.random() * charset.length)
    return charset[index]
  }).join('')

export const getRandomDate = () => {
  const maxDate = Date.now()
  const timestamp = Math.floor(Math.random() * maxDate)
  return new Date(timestamp)
}

export const addDotToGmail = (email: string) => {
  if (!email.endsWith('@gmail.com')) return email

  const [local, domain] = email.split('@')
  const dotIndex = Math.floor(Math.random() * local.length)
  return [email, `${local.slice(0, dotIndex)}.${local.slice(dotIndex)}@${domain}`]
}

// Sleep some time
export const wait = async (time: number, message: string = ''): Promise<string> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(message), time)
  })

export const sleep = async (time: number, message: boolean | string | null = null, prefix = '', mixer = -1) => {
  if (mixer === -1 || mixer > time) mixer = Math.floor(time / 3)
  time = randomRange(Number(time) - mixer, Number(time) + mixer)
  if (message === false) {
  } else if (!message) log(`sleep ${(time / 1000).toFixed(0)} s.`)
  else if (message)
    log(
      (prefix ? `${prefix} ` : '') +
        c.gray(typeof message === 'string' ? `sleep ${(time / 1000).toFixed(0)} s. | ${message}` : `sleep ${(time / 1000).toFixed(2)} seconds...`)
    )
  return wait(time, message as string)
}

// Arrays helpers
export const shuffle = <T>(array: T[]): T[] => (array && array.length > 0 ? array.sort(() => (Math.random() > 0.5 ? 1 : -1)) : array)
export const choice = <T>(array: T[]): T => shuffle(array)[0] as T
export const isSubset = <T>(a: T[], b: T[]): boolean => b.every((element) => a.includes(element))
export const removeDublicates = (array: any[], field: string) => array.filter((v, i, a) => a.findIndex((v2) => v2[field] === v[field]) === i)

export const chunkArray = <T>(array: T[], chunkSize: number): T[][] =>
  Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize))

// Converters
export const getQueryParam = (url: string, paramName: string): string | null => {
  const searchParams = new URLSearchParams(new URL(url).search)
  return searchParams.get(paramName)
}

// Onchain
export const findKeyByAddress = (keys: string[], address: Address | string): Hex | null =>
  keys.find((key) => {
    try {
      const account = privateKeyToAccount(key as Address)
      return isAddressEqual(account.address, checksumAddress(address) as Hex)
    } catch (e) {
      return null
    }
  }) as Hex | null
