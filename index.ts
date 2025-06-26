import { log } from 'console'
import c from 'chalk'
import all from './src/precheck'
import { checkIp, choice, findKeyByAddress, hex, shuffle, sleep, wait } from './src/helpers'
import { config } from './config'
import { DB, SAH, Sahara } from './src/sahara'
import { formatEther, Hex } from 'viem'
import { select } from '@inquirer/prompts'
import { Spinner } from '@topcli/spinner'
import { gotScraping } from 'got-scraping'
import { writeFileSync } from 'fs'
import { base, polygon } from 'viem/chains'

let { proxies, keys } = all

const workflowLogger = new Spinner({ verbose: config.SPINNER })

let proxyBlacklist: string[] = []
export const selectBestUnusedProxy = async (mode: string = 'login', address?: string) => {
  const allProxies = [
    ...proxies,
    ...(await DB.all()).filter((i: Sahara) => (i.ipInfo?.country && !['United Kingdom'].includes(i.ipInfo.country)) || !i.ipInfo).map((i: Sahara) => i.proxy)
  ]
    .flat()
    .filter((i) => !proxyBlacklist.includes(i))

  const proxiesCount = allProxies.reduce((acc: any, i: string) => {
    if (proxies.includes(i)) acc[i] = (acc[i] || 0) + 1
    return acc
  }, {}) as Record<string, number>

  let proxy = choice(Object.keys(proxiesCount).filter((i) => proxiesCount[i] === Math.min(...Object.values(proxiesCount))))

  if (!proxy) throw new Error('no proxy found')

  let valid: boolean | string = mode == 'simulate' ? true : false
  let attempts = 0
  while (!valid) {
    attempts++
    workflowLogger.text = c.red(`checking proxy (${attempts}) ${proxy.split('@')[1]}...`)
    valid = await checkIp(proxy)

    workflowLogger.text = `proxy ${proxy.split('@')[1]} is ${valid ? c.green('valid') : c.red('invalid')}`
    if (!valid) {
      proxyBlacklist.push(proxy)
      // log(proxyBlacklist)
      workflowLogger.text = c.red(`proxy ${proxy.split('@')[1]} is not valid, skipping...`)
      proxies = proxies.filter((i) => i !== proxy)
      proxy = await selectBestUnusedProxy(mode, address)
    } else workflowLogger.text = `found valid proxy for account ${address ? c.yellow(address) : ''}!`
  }

  return proxy
}

const work = async (key?: Hex, proxy?: string, indexer?: { id: number; total: number }, mode = 'login', address?: string) =>
  new Promise(async (resolve, reject) => {
    workflowLogger.text = `starting wallet ${indexer?.id} of ${indexer?.total}...`
    const start = Date.now()
    let user = new Sahara({ indexer, proxy, key, address })
    let amountBefore = user.userInfo ? SAH(user.userInfo.total_amount) : -1

    try {
      if (mode !== 'simulate' && (!(await user.ip()) || !user.proxy)) {
        const proxy = await selectBestUnusedProxy(mode, address)
        delete user.proxy
        user.save()
        user = new Sahara({ indexer, proxy, key, address })
      }

      workflowLogger.text = `wallet ${indexer?.id} of ${indexer?.total} is ready: ${c.yellow(user.address)}`

      switch (mode) {
        case 'sell':
          await user.sell(config.ODOS_FROM, config.ODOS_TO, true)
          break
        case 'check':
          await user.check()
          break
        case 'claim':
          await user.claim()
          break
        default:
          user.info('undefined mode')
      }
    } catch (e: any) {
      delete user.proxy
      user.save()
      user.error(`wallet work failed: ${e.message}`)
    }

    const seconds = Math.round((Date.now() - start) / 1000)
    const minutes = Math.floor(seconds / 60)
    const msg = c.grey(
      `${c.magenta('tasks ended')} - amount: ${c.cyan(SAH(user.userInfo?.total_amount || '0') + ' SAH')}, processing time: ${
        minutes > 0 ? `${minutes}m ` : ''
      }${seconds}s`
    )

    if (config.SPINNER && user.spinner) user.spinner.succeed(user.prefix(true) + msg)
    else user.l(msg)

    user.save()
    return resolve(true)
  })

let interrupted = false
const activeWorkers = new Set<Promise<any>>()
const workFlow = async (keys: Hex[], mode: string = 'login') => {
  const maxThreads = Math.min(config.THREADS, proxies.length)

  keys = [...new Set(config.SHUFFLE ? shuffle(keys) : keys)]

  if (mode === 'check') {
    const checked = (DB.all() as Sahara[]).filter((i) => i.userInfo)
    keys = keys.filter((i) => !checked.some((j) => j.key === i))
    log(c.green(`Filtered ${c.yellow(checked.length)} already checked addresses`))
  }

  if (mode === 'claim' || mode === 'sell') {
    const eligible = (DB.all() as Sahara[]).filter((i) => i.userInfo?.total_amount !== '0')
    keys = keys.filter((i) => eligible.some((j) => j.key === i))
    log(c.green(`Filtered ${c.yellow(eligible.length)} eligible addresses`))
  }

  const modeName = c.magenta('«' + mode.toUpperCase() + '»')
  log(c.cyan(`\nPrepared workflow for ${modeName} with ${c.yellow(keys.length)} keys\n`))
  if (keys.length === 1) config.SPINNER = false

  workflowLogger.start('Starting workflow...', { withPrefix: c.cyan(` Workflow ${modeName} (${keys.length}): `) })
  const indent = Math.abs(String(keys.length).length * 2 - 2)
  const header = new Spinner({ verbose: true })
    .start(`${c.grey(' '.repeat(indent) + 'idx')} ${c.grey('address' + ' '.repeat(config.HIDE_ADDRESSES ? 5 : 34))}   ${c.grey('status')}`)
    .succeed()
  await wait(1000)

  for (let i = 0; i < keys.length; i++) {
    while (activeWorkers.size >= maxThreads) {
      const [completedWorker] = await Promise.race([Promise.all(Array.from(activeWorkers).map((p) => p.then(() => p))), wait(1000).then(() => [null])])
      if (completedWorker) activeWorkers.delete(completedWorker)
    }

    if (interrupted) break

    let exist = (DB.all() as Sahara[]).find((a) => a.key === keys[i])
    let proxy = exist && exist.proxy ? exist.proxy : await selectBestUnusedProxy(mode)
    workflowLogger.text = `worker ${i + 1} of ${keys.length} is preparing...`
    const worker = work(keys[i], proxy, { id: i + 1, total: keys.length }, mode).finally(() => activeWorkers.delete(worker))
    workflowLogger.text = `worker ${i + 1} of ${keys.length} is prepared`
    activeWorkers.add(worker)
    workflowLogger.text = `worker ${i + 1} of ${keys.length} added!`

    if (activeWorkers.size > 0) await wait(config.MULTITHREAD_WAIT_BETWEEN_WALLETS)
    workflowLogger.text = `next key...`
  }

  if (activeWorkers.size > 0 || !interrupted) {
    workflowLogger.text = `waiting for all tasks to complete...`
    await Promise.all(activeWorkers)
  }

  return workflowLogger.succeed(`All tasks completed!`)
}

const stats = async () => {
  log(c.cyan(`Stats`))
  const registered = DB.all() as Sahara[]
  const totals = {
    checked: 0,
    amount: 0,
    claimed: 0,
    eligible: 0
  }
  const price = await gotScraping('https://coinranking.com/api/rates?coinUuid=9YLVC7Rb9&timePeriod=24h&referenceCurrencyUuid=yhjMzLPhuIDl', {
    headers: {
      Referer: 'https://coinranking.com/coin/9YLVC7Rb9+saharaai-sahara',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  })
    .json()
    .then((i: any) => i.rates.filter((i: any) => i.value > 0).shift().value)

  for (const user of registered) {
    let prefix = hex(user.address) + ':'
    if (user.userInfo) {
      totals.checked++
      totals.amount += SAH(user.userInfo.total_amount)
      totals.claimed += SAH(user.userInfo.claimed_amount)
      totals.eligible += SAH(user.userInfo.eligible_amount)
    }
  }

  log(c.magenta(`Price: ${c.yellow(price + ' USD')}`))
  log(c.magenta(`In database: ${c.yellow(registered.length)}`))
  const checked = registered.filter((i) => i.userInfo)
  log(c.magenta(`Checked: ${c.yellow(checked.length)}`))
  const eligible = checked.filter((i) => i.userInfo?.total_amount !== '0')
  log()
  log(c.green(`Eligible: ${c.yellow(eligible.length)}`))
  log(c.red(`Not eligible: ${c.yellow(checked.length - eligible.length)}`))
  log()

  writeFileSync(`generated/eligible.txt`, eligible.map((i) => i.address).join('\n'))

  const pints = Math.round((totals.amount * price) / 8)
  log(
    `Total amount: ${c.cyan(Math.round(totals.amount) + ' SAH')}, claimed: ${c.yellow(Math.round(totals.claimed) + ' SAH')}, eligible: ${c.yellow(
      Math.round(totals.eligible) + ' SAH'
    )}, average: ${c.yellow(Math.round(totals.amount / eligible.length) + ' SAH')} per eligible account`
  )

  log()

  log(
    c.cyan(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠠⠤⠤⠤⠠⠄⠠⠀⠤⠤⠤⠤⠤⠤⠀⠀⢀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⡀⠀⠐⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠀⠐⠀⠀⢀⠀⠀
⠀⠀⠂⠄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡁⠀
⠀⠀⡌⠂⠤⠈⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢀⡀⠀⠀⠀⠤⠄⠀⠐⠂⠈⠠⢃⠀
⠀⠀⠁⠀⠀     ${c.bold.white(`Guinness pints: ${c.yellow(pints)} pints`)}⠀⠀⠀⠀⠀⠀⠀⠀⠈⢸⠀
⠀⢠⠀⠀⠀⠀⠀⠀⠀           ${c.bold.hex('#278664')('~ $' + Math.round(totals.amount * price))}⠀⠀⠀⠀⠀⠀⠀⡀⠀
⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⡆
⠀⢸⣧⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣷⡇
⠀⣸⣿⣿⣿⣿⣿⣶⢦⣤⣤⣠⣀⣀⡀⣀⠀⠀⠀⡀⠀⠀⣀⢀⡀⢀⢀⡀⢀⢀⢀⣀⣀⣀⣠⣀⣤⣤⣴⣶⣿⣿⣿⣿⣯⡇
⠀⣞⣿⣿⣿⣿⣿⣏⢾⣱⢯⡻⣝⢾⡿⣍⢛⡻⣛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⠀⣿⣿⣿⣿⣿⣿⣏⢾⣭⢷⡻⣽⢺⡷⡌⢎⡵⣻⢼⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠆
⠀⣿⣿⣿⣿⣿⣿⡞⣽⣞⣯⡽⣏⣿⡟⡜⢢⢳⣝⡾⢩⣰⣬⣉⢛⠛⠛⠉⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⠀⣿⣿⣿⣿⣿⣿⣏⣷⣻⢾⣽⣳⢿⣿⡘⢧⣋⢾⡽⣞⡄⢿⣿⣟⢿⣾⠉⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢧
⠀⢿⣿⣿⣿⣿⣿⣞⣳⢯⣟⡾⣽⣾⣷⡙⣦⢛⣮⣟⣿⣹⡈⢿⣮⣳⡟⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢼
⠈⣼⣿⣿⣿⣿⣿⢾⡽⣯⢿⡽⣟⣾⣷⣹⣒⢯⡾⣽⣾⣧⢧⠘⣷⡿⠡⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⢮
⠀⡼⣿⣿⣿⣿⣿⣯⢿⣽⣟⣿⢿⣿⣿⡶⣹⢾⣻⣷⢻⢿⡞⣧⠞⢁⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣘
⠀⣽⣿⣿⣿⣿⣿⡗⢩⣤⣍⢹⣿⣿⣿⣿⣵⡻⣿⢿⣿⣿⣿⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣟⠢
⠀⡯⣾⣿⣿⣿⣿⠁⣼⣿⣿⣿⡆⢸⣿⡏⣹⡍⢹⣍⠙⣿⣿⢹⣏⠛⢿⣿⢙⣯⠉⣭⣭⡟⢭⣮⣿⠱⣶⣼⣿⣿⣿⣿⡟⡇
⠀⡷⣻⣿⣿⣿⣿⡆⢹⣿⡆⢸⡇⢸⣿⡇⢿⠀⢸⡏⣆⠈⢿⢸⡏⢣⠈⢻⢸⣿⠀⢿⢻⣧⡈⠙⢿⣦⡈⢻⣿⣿⣿⡿⣍⡇
⠀⢹⣷⣻⣿⣿⣿⣷⣌⡛⠃⢸⣇⠸⢿⠇⣿⠀⢸⡇⣿⣆⠈⢸⡇⢸⣧⠀⢸⡷⠀⣿⣿⢻⣿⠇⡸⠿⠏⣼⣿⣿⣿⣟⡧⠁
⠀⢸⢲⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣾⣿⣶⣾⣧⣿⣿⣧⣼⣧⣼⣿⣷⣼⣧⣴⣶⣾⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⢯⣼⠀
⠀⠈⡗⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢫⡎⠀
⠀⠀⢏⢷⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⢷⠃`)
  )
}

const test = async () => {
  return workFlow(keys.slice(9, 15), 'claim')
}

// Start modes
const start = async () => {
  let mode = process.argv[2]
  let addressOrIndex = process.argv[3]

  if (!mode)
    mode = await select({
      message: c.magenta('Select mode:'),
      default: 'full',
      choices: [
        { name: c.hex('#343445')('統') + ' ' + 'Stats', value: 'stats' },
        { name: c.hex('#343445')('入') + ' ' + 'Login to Sahara', value: 'login' },
        { name: c.hex('#323522')('門') + ' ' + 'Check allocation', value: 'check' },
        { name: c.hex('#323522')('門') + ' ' + 'Claim SAHARA tokens on BNB', value: 'claim' },
        { name: c.hex('#245465')('試') + ' ' + 'Test mode', value: 'test' }
      ]
    }).catch(() => process.exit(1))

  if (addressOrIndex) {
    config.SPINNER = false
    return work(
      typeof addressOrIndex === 'number' && parseInt(addressOrIndex) ? keys[addressOrIndex] : undefined,
      await selectBestUnusedProxy(mode, addressOrIndex),
      { id: 1, total: 1 },
      mode,
      addressOrIndex
    )
  }

  if (mode === 'stats') return stats()

  switch (mode) {
    case 'test':
      return test()
    case 'check':
    case 'sell':
    case 'claim':
      return workFlow(keys, mode)
    default:
      return workFlow(keys, mode)
  }
}

start()
// ssetInterval(() => start(), 1000 * 60 * 60 * 24)

process.on('SIGINT', async () => {
  interrupted = true
  if (workflowLogger) workflowLogger.failed(c.red(`workflow interrupted by user`))
  if (activeWorkers.size > 0) {
    await Promise.all(activeWorkers)
    return process.exit(0)
  }
})
