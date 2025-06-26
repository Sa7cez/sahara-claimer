export const ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'earndropId',
        type: 'uint256'
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'stageIndex',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'leafIndex',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'account',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256'
          },
          {
            internalType: 'bytes32[]',
            name: 'merkleProof',
            type: 'bytes32[]'
          }
        ],
        internalType: 'struct VestingEarndrop.ClaimParams',
        name: 'params',
        type: 'tuple'
      },
      {
        internalType: 'bytes',
        name: '_signature',
        type: 'bytes'
      }
    ],
    name: 'claimEarndrop',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'earndropId',
        type: 'uint256'
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'stageIndex',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'leafIndex',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'account',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256'
          },
          {
            internalType: 'bytes32[]',
            name: 'merkleProof',
            type: 'bytes32[]'
          }
        ],
        internalType: 'struct VestingEarndrop.ClaimParams[]',
        name: 'params',
        type: 'tuple[]'
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes'
      }
    ],
    name: 'multiClaimEarndrop',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
] as const
