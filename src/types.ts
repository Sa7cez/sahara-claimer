import { AbiItem, Address, Hex } from 'viem'

export interface Info {
  total_amount: string
  allocation_breakdown: any[]
  claimed_amount: string
  eligible_amount: string
  stages: Stage[]
}

interface Stage {
  stage_id: number
  stage_index: number
  start_at: number
  end_at: number
  status: string
  amount: string
}

// Odos

export interface Balance {
  address: Address
  balance: number
}

export interface Router {
  chainId: number
  routerAddress: Address
  executorAddress: Address
  routerAbi: AbiItem[]
  erc20Abi: Erc20Abi
}

interface Erc20Abi {
  _format: string
  contractName: string
  sourceName: string
  abi: AbiItem[]
  bytecode: string
  deployedBytecode: string
  linkReferences: any
  deployedLinkReferences: any
}

export interface Token {
  address: Address
  name: string
  symbol: string
  decimals: number
  assetId: string
  assetType: string
  protocolId: string | null
  isRebasing: boolean
}

export interface Quote {
  inTokens: Address[]
  outTokens: Address[]
  inAmounts: string[]
  outAmounts: string[]
  gasEstimate: number
  dataGasEstimate: number
  gweiPerGas: number
  gasEstimateValue: number
  inValues: number[]
  outValues: number[]
  netOutValue: number
  priceImpact: number
  percentDiff: number
  partnerFeePercent: number
  pathId: string
  pathViz: PathViz
  blockNumber: number
  errorCode?: number
  detail?: string
}

interface PathViz {
  nodes: Node[]
  links: Link[]
}

interface Link {
  source: number
  target: number
  sourceExtend: boolean
  targetExtend: boolean
  label: string
  value: number
  nextValue: number
  stepValue: number
  in_value: number
  out_value: number
  edge_len: number
  sourceToken: SourceToken
  targetToken: TargetToken
}

interface TargetToken {
  name: string
  symbol: string
  decimals: number
  asset_id?: string
  asset_type?: string
  is_rebasing?: boolean
  cgid?: string
}

interface SourceToken {
  name: string
  symbol: string
  decimals: number
  asset_id: string
  asset_type: string
  is_rebasing: boolean
  cgid: string
}

interface Node {
  name: string
  symbol: string
  decimals: number
  visible: boolean
  width: number
}

export interface Assemble {
  deprecated: null
  blockNumber: number
  gasEstimate: number
  gasEstimateValue: number
  inputTokens: InputToken[]
  outputTokens: InputToken[]
  netOutValue: number
  outValues: string[]
  transaction: Transaction
  simulation: Simulation
}

interface Simulation {
  isSuccess: boolean
  amountsOut: number[]
  gasEstimate: number
  simulationError: null
}

interface Transaction {
  gas: number
  gasPrice: number
  value: string
  to: Address
  from: Address
  data: Hex
  nonce: number
  chainId: number
}

interface InputToken {
  tokenAddress: string
  amount: string
}
