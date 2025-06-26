export const ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_signer',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_treasurer',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address'
      }
    ],
    name: 'AddressEmptyCode',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'AddressInsufficientBalance',
    type: 'error'
  },
  {
    inputs: [],
    name: 'ECDSAInvalidSignature',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256'
      }
    ],
    name: 'ECDSAInvalidSignatureLength',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32'
      }
    ],
    name: 'ECDSAInvalidSignatureS',
    type: 'error'
  },
  {
    inputs: [],
    name: 'EarndropAlreadyExists',
    type: 'error'
  },
  {
    inputs: [],
    name: 'FailedInnerCall',
    type: 'error'
  },
  {
    inputs: [],
    name: 'InvalidAddress',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'msg',
        type: 'string'
      }
    ],
    name: 'InvalidParameter',
    type: 'error'
  },
  {
    inputs: [],
    name: 'InvalidProof',
    type: 'error'
  },
  {
    inputs: [],
    name: 'InvalidShortString',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      }
    ],
    name: 'OwnableInvalidOwner',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error'
  },
  {
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      }
    ],
    name: 'SafeERC20FailedOperation',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'str',
        type: 'string'
      }
    ],
    name: 'StringTooLong',
    type: 'error'
  },
  {
    inputs: [],
    name: 'TransferFailed',
    type: 'error'
  },
  {
    inputs: [],
    name: 'Unauthorized',
    type: 'error'
  },
  {
    anonymous: !1,
    inputs: [],
    name: 'EIP712DomainChanged',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'earndropId',
        type: 'uint256'
      },
      {
        indexed: !1,
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address'
      },
      {
        indexed: !1,
        internalType: 'bytes32',
        name: 'merkleTreeRoot',
        type: 'bytes32'
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256'
      },
      {
        components: [
          {
            internalType: 'uint48',
            name: 'startTime',
            type: 'uint48'
          },
          {
            internalType: 'uint48',
            name: 'endTime',
            type: 'uint48'
          }
        ],
        indexed: !1,
        internalType: 'struct VestingEarndrop.Stage[]',
        name: 'stages',
        type: 'tuple[]'
      },
      {
        indexed: !1,
        internalType: 'address',
        name: 'admin',
        type: 'address'
      }
    ],
    name: 'EarndropActivated',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'earndropId',
        type: 'uint256'
      },
      {
        indexed: !0,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address'
      },
      {
        indexed: !0,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address'
      }
    ],
    name: 'EarndropAdminTransferred',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        internalType: 'uint256',
        name: 'earndropId',
        type: 'uint256'
      },
      {
        indexed: !0,
        internalType: 'uint256',
        name: 'stageIndex',
        type: 'uint256'
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'leafIndex',
        type: 'uint256'
      },
      {
        indexed: !1,
        internalType: 'address',
        name: 'account',
        type: 'address'
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'EarndropClaimed',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'earndropId',
        type: 'uint256'
      },
      {
        indexed: !1,
        internalType: 'address',
        name: 'admin',
        type: 'address'
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256'
      }
    ],
    name: 'EarndropConfirmed',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'earndropId',
        type: 'uint256'
      },
      {
        indexed: !1,
        internalType: 'bool',
        name: 'revocable',
        type: 'bool'
      }
    ],
    name: 'EarndropRevocableSet',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'earndropId',
        type: 'uint256'
      },
      {
        indexed: !1,
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        indexed: !1,
        internalType: 'uint256',
        name: 'remainingAmount',
        type: 'uint256'
      }
    ],
    name: 'EarndropRevoked',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !1,
        internalType: 'address',
        name: 'newSigner',
        type: 'address'
      }
    ],
    name: 'EarndropSetSigner',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !1,
        internalType: 'address',
        name: 'newTreasurer',
        type: 'address'
      }
    ],
    name: 'EarndropSetTreasurer',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: !0,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferStarted',
    type: 'event'
  },
  {
    anonymous: !1,
    inputs: [
      {
        indexed: !0,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: !0,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'admin',
        type: 'address'
      },
      {
        internalType: 'bytes32',
        name: 'merkleTreeRoot',
        type: 'bytes32'
      },
      {
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256'
      },
      {
        components: [
          {
            internalType: 'uint48',
            name: 'startTime',
            type: 'uint48'
          },
          {
            internalType: 'uint48',
            name: 'endTime',
            type: 'uint48'
          }
        ],
        internalType: 'struct VestingEarndrop.Stage[]',
        name: '_stagesArray',
        type: 'tuple[]'
      },
      {
        internalType: 'bytes',
        name: '_signature',
        type: 'bytes'
      }
    ],
    name: 'activateEarndrop',
    outputs: [],
    stateMutability: 'nonpayable',
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
      }
    ],
    name: 'confirmActivateEarndrop',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256'
      }
    ],
    name: 'earndrops',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'claimedAmount',
        type: 'uint256'
      },
      {
        internalType: 'bytes32',
        name: 'merkleTreeRoot',
        type: 'bytes32'
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address'
      },
      {
        internalType: 'uint96',
        name: 'earndropId',
        type: 'uint96'
      },
      {
        internalType: 'address',
        name: 'admin',
        type: 'address'
      },
      {
        internalType: 'bool',
        name: 'revoked',
        type: 'bool'
      },
      {
        internalType: 'bool',
        name: 'revocable',
        type: 'bool'
      },
      {
        internalType: 'bool',
        name: 'confirmed',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      {
        internalType: 'bytes1',
        name: 'fields',
        type: 'bytes1'
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'version',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'verifyingContract',
        type: 'address'
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32'
      },
      {
        internalType: 'uint256[]',
        name: 'extensions',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'earndropId',
        type: 'uint256'
      }
    ],
    name: 'getEarndropStages',
    outputs: [
      {
        components: [
          {
            internalType: 'uint48',
            name: 'startTime',
            type: 'uint48'
          },
          {
            internalType: 'uint48',
            name: 'endTime',
            type: 'uint48'
          }
        ],
        internalType: 'struct VestingEarndrop.Stage[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
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
        internalType: 'uint256',
        name: 'leafIndex',
        type: 'uint256'
      }
    ],
    name: 'isClaimed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
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
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      }
    ],
    name: 'revokeEarndrop',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'bool',
        name: 'revocable',
        type: 'bool'
      }
    ],
    name: 'setEarndropRevocable',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_signer',
        type: 'address'
      }
    ],
    name: 'setSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_treasurer',
        type: 'address'
      }
    ],
    name: 'setTreasurer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'signer',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
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
        internalType: 'address',
        name: 'newAdmin',
        type: 'address'
      }
    ],
    name: 'transferEarndropAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'treasurer',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const
