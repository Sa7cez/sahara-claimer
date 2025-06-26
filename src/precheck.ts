import { log } from 'console'
import { readDiscords, readFile, readKeys, readProxies } from './store'
import { Hex } from 'viem'
import c from 'chalk'
import { choice, sleep } from 'helpers'
import { space, banners } from 'greetings'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

export const proxies = readProxies()
//export const discords = readDiscords()
//export const addresses = readFile('addresses.txt') as string[]
export const keys = readKeys() as Hex[]
//export const emails = readFile('emails.txt') as string[]

if (!existsSync('./generated')) mkdirSync('./generated', { recursive: true })

log(c.magenta(`\nHello bro, soft by ${c.cyan('Salce ツ')}\n`))
const empty = '·'
const banner = choice(banners)
  .replace(space, c.cyan(`keys`) + c.cyanBright(empty.repeat(space.length - String(keys.length).length - 4)) + c.cyan(keys.length))
  .replace(space, c.magenta(`proxies`) + c.magentaBright(empty.repeat(space.length - String(proxies.length).length - 7)) + c.magenta(proxies.length))
  // .replace(space, c.blue(`discords`) + c.blueBright(empty.repeat(space.length - String(discords.length).length - 8)) + c.blue(discords.length))
  // .replace(space, c.red(`addresses`) + c.redBright(empty.repeat(space.length - String(addresses.length).length - 9)) + c.red(addresses.length))
  // .replace(space, c.green(`emails`) + c.greenBright(empty.repeat(space.length - String(emails.length).length - 6)) + c.green(emails.length))
  .replaceAll(space, ' '.repeat(space.length))

log(c.cyan(banner), '\n')

export default {
  proxies,
  //discords,
  // addresses,
  keys
}
