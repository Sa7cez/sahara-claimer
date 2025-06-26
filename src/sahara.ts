// MoonCoin
import { log } from 'console'
import { gotScraping, GotScraping } from 'got-scraping'
import c from 'chalk'

import { addDotToGmail, checkIp, choice, findKeyByAddress, hex, shuffle, sleep, wait } from './helpers'
import { LocalJsonDatabase, readDiscords, readFile, SQLiteDatabase } from './store'
import { faker } from '@faker-js/faker'
import { config } from '../config'
import {
  Account,
  Address,
  Chain,
  checksumAddress,
  createWalletClient,
  encodeFunctionData,
  erc20Abi,
  formatEther,
  formatGwei,
  formatUnits,
  Hex,
  http,
  isAddress,
  maxUint256,
  parseEther,
  parseUnits,
  PrivateKeyAccount,
  publicActions,
  PublicActions,
  Transport,
  WalletClient
} from 'viem'
import { keys } from 'precheck'
import { privateKeyToAccount } from 'viem/accounts'
import { randomInt, randomUUID } from 'crypto'
import { input } from '@inquirer/prompts'
import { Spinner } from '@topcli/spinner'
import { appendFileSync } from 'fs'
import { bsc } from 'viem/chains'
import { Balance, Router, Info, Quote, Assemble } from 'types'
import { ABI } from './contract'

import { createClient, convertViemChainToRelayChain, MAINNET_RELAY_API, getClient } from '@reservoir0x/relay-sdk'
import { mainnet } from 'viem/chains'

createClient({
  baseApiUrl: MAINNET_RELAY_API
})

export const DB = new SQLiteDatabase('newton')

const spinnerOptions = {
  name: 'dots5'
  // verbose: false
}

const GEETEST = 'af3df3cfea3ff15d591668e59dbd9677'

export const SAH = (amount: string) => Number(formatUnits(BigInt(amount), 18))

const findKeyByAddressOrString = (address: string): Hex | null => {
  try {
    const directFind = isAddress(address) ? findKeyByAddress(keys, address) : null
    if (directFind) return directFind
    else throw new Error(`Not found`)
  } catch (e: any) {
    try {
      const dbFind = (DB.all() as Sahara[]).find((i) => i.address.toLowerCase().indexOf(address.toLowerCase()!) !== -1)
      if (dbFind) return dbFind.key
      else throw new Error('Private key not found in db')
    } catch (e: any) {
      throw new Error('Private key not found in keys.txt or db: ' + e.message)
    }
  }
}

export class Sahara {
  indexer?: { id: number; total: number }
  address: string
  account: PrivateKeyAccount
  viemClient: WalletClient<Transport, Chain> & PublicActions
  key: Hex
  jwt: string | null = null
  uuid = randomUUID()
  proxy?: string
  ipInfo:
    | {
        ip: string
        location?: string
        country?: string
      }
    | undefined
  web: GotScraping
  points: number = 0
  spinner: Spinner | null = null
  userInfo: Info | null = null

  constructor(options: { indexer?: { id: number; total: number }; proxy?: string; address?: string; key?: Hex; discord?: string }) {
    if (!options.address && !options.key) throw new Error('Address or key is required')
    if (options.proxy) this.proxy = options.proxy
    if (options.indexer) this.indexer = options.indexer
    if (options.key) this.key = options.key
    else {
      const storedKey = findKeyByAddressOrString(options.address!)
      if (storedKey) this.key = storedKey
      else throw new Error('Private key not found in keys.txt or db')
    }

    try {
      this.account = privateKeyToAccount(this.key)
      this.address = checksumAddress(this.account.address)
      this.viemClient = createWalletClient({
        account: this.account,
        chain: bsc,
        transport: http('https://56.rpc.thirdweb.com')
      }).extend(publicActions)
    } catch (e: any) {
      this.error(`failed to create account with key ${this.key}, error: ${e.message}`)
      throw new Error('failed to create account')
    }

    Object.assign(this, DB.find('address', this.address))

    if (!this.proxy) this.proxy = options.proxy
    if (!this.proxy) throw new Error('proxy is required')

    this.spinner = config.SPINNER ? new Spinner(spinnerOptions).start(this.prefix(true) + c.cyan('initializing...')) : null

    this.web = gotScraping.extend({
      headers: {
        Origin: 'https://knowledgedrop.saharaai.com',
        Referer: 'https://knowledgedrop.saharaai.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },
      ...(this.proxy ? { proxyUrl: this.proxy } : {}),
      hooks: {
        beforeRetry: [
          (error: any, retryCount: number) => {
            // Логика повторных попыток
          }
        ],
        beforeRequest: [
          (options: any) => {
            if (this.jwt) options.headers.authorization = this.jwt
          }
        ]
      },
      retry: {
        limit: 3,
        errorCodes: ['ERR_BODY_PARSE_FAILURE']
      }
    })
  }

  save() {
    return DB.set(this.address, this)
  }

  ip = async () =>
    this.get('https://wtfismyip.com/json')
      .then((res: any) => {
        this.info(`proxy ip: ${c.yellow(res.YourFuckingIPAddress)}, location: ${c.blue(res.YourFuckingLocation)}, country: ${c.green(res.YourFuckingCountry)}`)
        this.ipInfo = {
          ip: res.YourFuckingIPAddress,
          location: res.YourFuckingLocation,
          country: res.YourFuckingCountry
        }
        return res
      })
      .catch((e) => {
        return this.get('https://api.ipify.org?format=json')
          .then((res: any) => {
            this.info(`ip: ${c.yellow(res.ip)}`)
            this.ipInfo = { ip: res.ip }
            return res
          })
          .catch(() => {
            throw new Error('failed to get ip, invalid proxy, please check manually!')
          })
      })

  short = () => (config.HIDE_ADDRESSES ? `${this.address.slice(0, 4)}...${this.address.slice(-6)}` : this.address)
  prefix = (forSpinner = true) => {
    const address = this.short()
    let prefix = this.address ? hex(address) : hex('unknown')

    if (this.indexer) {
      const id = ' '.repeat(Math.abs(String(this.indexer.id).length - String(this.indexer.total).length)) + this.indexer.id
      prefix = (!forSpinner ? '  ' : '') + c.hex('#FFF67E')(id) + c.grey('/') + c.hex('#CCD3CA')(this.indexer.total) + ' ' + prefix
    }

    return prefix + c.white(':') + (forSpinner ? ' ' : '')
  }

  l(...args: any[]): false {
    if (this.spinner && config.SPINNER) {
      this.spinner.text = this.prefix(true) + args.map((i) => (typeof i === 'string' ? i : JSON.stringify(i))).join(' ')
      return false
    } else {
      args = Array.from(args)
      args.unshift(this.prefix(false))
      return console.log.apply(console, args) as unknown as false
    }
  }
  success = (...args: any[]) => this.l(...args.map((i) => (typeof i === 'string' ? c.green(i) : i))) || true
  info = (...args: any[]) => this.l(...args.map((i) => (typeof i === 'string' ? c.grey(i) : i)))
  error = (...args: any[]) => {
    let error = new Date().toISOString() + ' ' + this.short() + ': ' + args.map((i) => (typeof i === 'string' ? i : JSON.stringify(i, null, 2))).join(' ')
    appendFileSync('generated/errors.txt', error + '\n')
    args[0] = c.red(args[0])
    return this.l(...args)
  }

  sleep = (time: number) => sleep(time, false, hex(this.address))
  sign = (message: string) => this.account.signMessage({ message })

  private capsolver = async (task: any, retry = 0): Promise<any> => {
    const clientKey = choice(config.CAPSOLVERS)
    try {
      const res = await gotScraping
        .post('https://api.capsolver.com/createTask', {
          json: {
            clientKey,
            appId: '10654BC8-01A3-414D-9FEC-3DD9906D5945',
            task: {
              ...task,
              proxy: this.proxy
            }
          }
        })
        .json()
        .catch((e: any) => this.error('failed to create task:', e.message))

      const task_id = res.taskId
      if (!task_id) {
        if (['ERROR_ZERO_BALANCE', 'ERROR_KEY_DENIED_ACCESS'].includes(res.errorCode)) {
          config.CAPSOLVERS = config.CAPSOLVERS.filter((i) => i !== clientKey)
          this.info('update capsolver keys:', config.CAPSOLVERS)
          return this.capsolver(task)
        }

        return this.error('failed to create task:', res)
      }

      while (true) {
        if (config.SPINNER && this.spinner) this.spinner.text = c.grey(this.prefix(true) + `captcha ${c.gray(task_id)} solving...`)
        await wait(1000)

        const getResultPayload = { clientKey, taskId: task_id }
        const res = await gotScraping
          .post('https://api.capsolver.com/getTaskResult', { json: getResultPayload })
          .json()
          .catch((e: any) => this.error('failed to get task result:', e.message))

        const status = res.status

        if (status === 'ready') {
          this.success(`captcha ${c.gray(task_id)} successfully solved!`)
          return res.solution
        }

        if (status === 'failed' || res.errorId) {
          if (res.errorCode === 'ERROR_CAPTCHA_SOLVE_FAILED' && retry < 3) return this.capsolver(task, retry + 1)
          return this.error('solve failed! response:', res)
        }
      }
    } catch (error) {
      this.error('Error:', error)
    }
  }

  simulate = async () => {
    while (Math.random() < 0.9) {
      if (Math.random() < 0.9) this.error('simulate error message')
      else if (Math.random() < 0.7) this.info('simulate info message')
      else if (Math.random() < 0.8) this.success('simulate success message')
      else if (Math.random() < 0.9) this.error('simulate error with object', { user: this.userInfo })
      else this.l(`simulate standart message ${randomUUID()}`)

      await wait(500)
    }
    if (this.spinner) this.spinner.succeed(this.prefix(true) + c.green('simulate with spinner ended'))
    else this.success('simulate ended')
    return true
  }

  get = async (url: string, headers: any = {}, retry = 0, fallbackResult: any = null) =>
    this.web
      .get(url, { headers })
      .json()
      .catch(async (e: any) => {
        if (e.message.includes('is not valid JSON')) {
          await this.sleep(250)
          return retry < 3 ? this.get(url, headers, retry + 1, fallbackResult) : fallbackResult
        }
        this.error('GET request failed:', e.message)
        return fallbackResult
      })

  assetsBalances = async (chain: Chain | number): Promise<Balance[]> =>
    gotScraping(`https://api.odos.xyz/balances/${this.address}/${typeof chain === 'number' ? chain : chain.id}`)
      .json()
      .then((r: any) => r?.balances.filter((i: any) => i.balance > 0) || []) as { address: string; balance: number }[]

  router = async (chain: Chain) => gotScraping(`https://api.odos.xyz/info/contract-info/v2/${chain.id}`).json() as Router

  tokens = async (chain: Chain | number) =>
    gotScraping(`https://api.odos.xyz/info/tokens/${typeof chain === 'number' ? chain : chain.id}`)
      .json()
      .then((r: any) => Object.entries(r.tokenMap).map(([key, value]: any) => ({ ...value, address: key })))

  gasPrices = async (chain: Chain | number) =>
    gotScraping(`https://api.odos.xyz/gas/price/${typeof chain === 'number' ? chain : chain.id}`)
      .json()
      .then((r: any) => r.prices)

  getTokenBalance = async (address: Address) =>
    address === '0x0000000000000000000000000000000000000000'
      ? this.viemClient.getBalance({ address: this.address })
      : this.viemClient
          .readContract({
            address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [this.address]
          })
          .catch((e) => {
            this.l(`can't get token balance of ${address} on Binance Smart Chain:`, e.message)
            return 0n
          })

  allowance = async (address: Hex, spender: Hex) =>
    this.viemClient
      .readContract({
        address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [this.address, spender]
      })
      .catch((e) => {
        this.l(`can't get token allowance of ${address}`)
        return 0n
      })

  approveToken = async (contract: Hex, spender: Hex, amount: bigint = maxUint256) => {
    if ((await this.allowance(contract, spender)) >= amount) return this.l(c.gray(`token ${contract} already approve spending ${spender}!`)) || true

    return this.viemClient.writeContract({
      address: contract,
      abi: erc20Abi,
      functionName: 'approve',
      account: this.account,
      args: [spender, amount]
    })
  }

  sell = async (tokenIn: Address, tokenOut: Address = '0x0000000000000000000000000000000000000000', drainMode: boolean = false) => {
    if (tokenIn === tokenOut) return this.error(`token in and token out are the same!`)

    const userAddr = this.address

    const slippageLimitPercent = config.ODOS_SLIPPAGE ? Number(config.ODOS_SLIPPAGE) : 0.5
    const { routerAddress } = await this.router(bsc)
    // this.l(`router address:`, c.blue(routerAddress))

    const amount = await this.getTokenBalance(tokenIn)
    if (amount === 0n) return this.error(`balance of ${tokenIn} is zero!`)
    else this.success(`balance:`, c.blue(`${formatUnits(amount, 18)} ${tokenIn}`))
    const gasPrices = await this.gasPrices(bsc)

    let customGasPrice =
      !gasPrices || gasPrices.length === 0
        ? null
        : config.ODOS_GAS_PRICE === 'Standard'
        ? gasPrices[2].fee
        : config.ODOS_GAS_PRICE === 'Fast'
        ? gasPrices[1].fee
        : gasPrices[0].fee

    if (!customGasPrice) customGasPrice = undefined

    const quote: Quote | false = await gotScraping
      .post('https://api.odos.xyz/sor/quote/v2', {
        json: {
          chainId: bsc.id,
          compact: true,
          disableRFQs: false,
          gasPrice: customGasPrice,
          inputTokens: [
            {
              tokenAddress: tokenIn,
              amount: amount.toString()
            }
          ],
          likeAsset: true,
          outputTokens: [
            {
              tokenAddress: tokenOut,
              proportion: 1
            }
          ],
          pathViz: true,
          referralCode: 1,
          userAddr,
          slippageLimitPercent,
          sourceBlacklist: []
        }
      })
      .json()
      .catch((e: any) => this.error(`fetch quote failed:`, e.message))

    if (!quote) return false
    if (quote.errorCode) return this.error(`quote failed: ${quote?.detail}`)

    if (quote.outValues[0] < quote.gasEstimateValue) return this.error(`amount out is too low: ${quote.outValues[0]}, gas fee: ${quote.gasEstimateValue}`)

    if (!drainMode && quote.outValues[0] < config.ODOS_MIN_AMOUNT) return this.error(`amount out is too low: ${quote.outValues[0]}`)

    await this.approveToken(tokenIn, routerAddress)

    const assemble: Assemble | false = await gotScraping
      .post('https://api.odos.xyz/sor/assemble', {
        json: {
          userAddr,
          pathId: quote.pathId,
          simulate: true
        }
      })
      .json()
      .catch((e: any) => this.error(`fetch assemble failed:`, e.message))

    if (!assemble) return false
    const route = quote.pathViz.nodes.map((i: any) => c.blue(i.symbol)).join(' -> ')
    if (!assemble.simulation.isSuccess) return this.error(`swap ${route} on Odos simulation failed!`)

    const { to, data: calldata, gas: gasLimit, gasPrice } = assemble.transaction

    return this.viemClient
      .sendTransaction({
        account: this.account,
        to,
        data: calldata,
        gas: BigInt(gasLimit),
        gasPrice: BigInt(gasPrice)
      })
      .then((tx) => {
        this.success(`swap tx sent: ${c.blue('https://bscscan.com/tx/' + tx)}`)
        return tx
      })
      .catch((e) => {
        this.error('failed to swap:', e.message)
        return null
      })
  }

  // bridge = async (chainId: number, toChainId: number, amount?: number, recipient = this.address) => {
  //   const quoteParams = {
  //     chainId,
  //     toChainId,
  //     currency: '0x0000000000000000000000000000000000000000',
  //     toCurrency: '0x0000000000000000000000000000000000000000',
  //     amount: amount ? parseEther(String(amount)).toString() : '100000000000000000000', // 0.0001 ETH
  //     wallet: this.viemClient,
  //     user: this.address,
  //     recipient,
  //     tradeType: 'EXACT_INPUT'
  //   }
  //   log(quoteParams)
  //   const quote = await getClient()?.actions.getQuote(quoteParams)
  //   if (!quote.fees) return this.l(c.red(`can't get quote fees from ${'Relay'}`))

  //   // const fee = await this.nativeToUsd(from, parseFloat(formatUnits(BigInt(quote.fees.relayer!) + BigInt(quote.fees.gas!), from.nativeCurrency.decimals)))
  //   // const maxBridgeCost = 0.025
  //   // if (fee > maxBridgeCost) return this.l(`Relay bridge reverted, cost ${fee} USD, your limit ${maxBridgeCost} USD`)

  //   const bridged = await Promise.race([
  //     await getClient()?.actions.execute({
  //       quote,
  //       wallet: this.viemClient
  //     }),
  //     new Promise((resolve) => {
  //       setTimeout(() => resolve(true), 60 * 1000)
  //     })
  //   ])

  //   if (bridged) this.l(c.green(`Relay bridge success!`))
  //   return bridged
  // }

  claim = async () => {
    const {
      lot_number: lotNumber,
      captcha_output: captchaOutput,
      pass_token: passToken,
      gen_time: genTime
    } = await this.capsolver({
      type: 'GeeTestTaskProxyLess',
      captchaId: GEETEST,
      websiteURL: 'https://knowledgedrop.saharaai.com/'
    })

    const prepare = await this.web
      .post('https://earndrop.prd.galaxy.eco/sahara/prepare_claim', {
        json: { captcha: { lotNumber, captchaOutput, passToken, genTime } }
      })
      .json()
      .catch((e: any) => this.error('failed to prepare claim:', e.message))

    if (prepare.error) {
      const balance = await this.getTokenBalance(config.ODOS_FROM)
      if (balance > 0n && config.SELL_ON_ODOS) {
        return this.sell(config.ODOS_FROM, config.ODOS_TO, true)
      }
      return this.error('failed to prepare claim or already claimed:', prepare.error)
    }

    const { earndrop_id, claim_fee, contract_address, signature, params } = prepare.data

    return this.viemClient
      .writeContract({
        account: this.account,
        address: contract_address,
        abi: ABI,
        functionName: 'claimEarndrop',
        value: BigInt(claim_fee),
        args: [
          BigInt(earndrop_id),
          {
            stageIndex: BigInt(params[0].stage_index),
            leafIndex: BigInt(params[0].leaf_index),
            account: this.address,
            amount: BigInt(params[0].amount),
            merkleProof: params[0].merkle_proof
          },
          signature
        ]
      })
      .then(async (tx) => {
        this.success(`claim tx sent: ${c.blue('https://bscscan.com/tx/' + tx)}`)
        await this.viemClient.waitForTransactionReceipt({ hash: tx })
        this.info(`claim tx confirmed: ${c.blue('https://bscscan.com/tx/' + tx)}`)
        await this.sleep(2000)
        if (config.SELL_ON_ODOS) await this.sell(config.ODOS_FROM, config.ODOS_TO, true)
        return tx
      })
      .catch((e) => {
        this.error('failed to claim:', e.message)
        return null
      })
  }

  check = async (force = false) => {
    if (!this.jwt) {
      const issuedAt = new Date().toISOString() // 2025-06-25T10:28:03.789Z
      const expirationTime = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 2025-07-02T10:28:03.784Z
      const message = `knowledgedrop.saharaai.com wants you to sign in with your Ethereum account:\n${this.address}\n\nSign in with Ethereum to the app.\n\nURI: https://knowledgedrop.saharaai.com\nVersion: 1\nChain ID: ${bsc.id}\nNonce: VGf4XELr0EhPTExmr\nIssued At: ${issuedAt}\nExpiration Time: ${expirationTime}`
      const signature = await this.sign(message)
      await this.web
        .post('https://earndrop.prd.galaxy.eco/sign_in', {
          json: {
            address: this.address,
            signature,
            message,
            public_key: ''
          }
        })
        .json()
        .then((res: any) => (this.jwt = res.token))
        .catch((e: any) => this.error('failed to login:', e.message))
    } else this.info('already logged in!')

    if (this.jwt) {
      if (!this.userInfo && !force)
        await this.get('https://earndrop.prd.galaxy.eco/sahara/info')
          .then((res) => (this.userInfo = res.data))
          .catch((e) => this.error('failed to get user info:', e.message))

      if (!this.userInfo) return this.error('failed to get user info!')

      // log(this.userInfo)

      if (SAH(this.userInfo.total_amount) > 0) {
        this.success(
          `${c.yellow(SAH(this.userInfo.eligible_amount))} eligible to claim, ${c.yellow(SAH(this.userInfo.claimed_amount))} claimed, ${c.yellow(
            SAH(this.userInfo.total_amount)
          )} total`
        )

        if (this.userInfo.stages.filter((i) => i.status === 'UnLocked').length > 0) {
          if (SAH(this.userInfo.eligible_amount) > 0) {
            this.success('claiming...')
            return this.claim()
          } else {
            this.error('no eligible amount to claim!')
          }
        }
      } else {
        this.error('not eligible to claim!')
      }
    } else this.error('failed to login!')

    return this.userInfo
  }
}
