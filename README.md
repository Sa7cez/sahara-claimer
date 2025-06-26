# Sahara Token Claimer 🏜️

A powerful and efficient tool for claiming Sahara (SAH) tokens from the Sahara AI Knowledge Drop airdrop. Built with TypeScript and Viem for seamless interaction with the Binance Smart Chain.

## 🌟 Features

- **Multi-wallet Support**: Process multiple wallets simultaneously with configurable threading
- **Proxy Support**: Built-in proxy rotation and validation for enhanced privacy
- **Captcha Solving**: Integrated Capsolver support for automated captcha solving
- **Smart Claiming**: Automatic detection of eligible amounts and unlocked stages
- **Token Swapping**: Integrated Odos DEX for instant token swapping to BNB
- **Database Storage**: SQLite database for persistent wallet and transaction data
- **Real-time Statistics**: Live tracking of claim amounts, prices, and success rates
- **Error Handling**: Robust error handling with detailed logging and retry mechanisms

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- BNB Smart Chain wallet with private keys
- Proxy list (optional but recommended)
- Capsolver API keys (for captcha solving)

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sahara-claimer
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure the project**
   ```bash
   cp config_example.ts config.ts
   ```

## ⚙️ Configuration

Edit `config.ts` to customize the claimer behavior:

```typescript
export const config = {
  // Capsolver API keys for captcha solving
  CAPSOLVERS: ['your_capsolver_key_1', 'your_capsolver_key_2'],

  // Performance settings
  SHUFFLE: true, // Randomize wallet processing order
  THREADS: 3, // Number of concurrent wallets
  MULTITHREAD_WAIT_BETWEEN_WALLETS: 1000, // Delay between wallet starts (ms)

  // UI settings
  SPINNER: true, // Show progress spinners
  HIDE_ADDRESSES: false, // Hide full wallet addresses in logs

  // Odos DEX settings
  SELL_ON_ODOS: true, // Auto-sell tokens after claiming
  ODOS_SLIPPAGE: 0.5, // Slippage tolerance (%)
  ODOS_FROM: '0xFDFfB411C4A70AA7C95D5C981a6Fb4Da867e1111', // SAH token address
  ODOS_TO: '0x0000000000000000000000000000000000000000', // BNB address
  ODOS_GAS_PRICE: 'Standard', // Gas price: Standard, Fast, Rapid
  ODOS_MIN_AMOUNT: 1 // Minimum USD amount to trigger sell
}
```

## 📁 File Structure

```
sahara-claimer/
├── config.ts                 # Main configuration file
├── config_example.ts         # Configuration template
├── index.ts                  # Main entry point
├── package.json              # Dependencies and scripts
├── src/
│   ├── sahara.ts            # Core Sahara claimer class
│   ├── contract.ts          # Smart contract ABIs and interactions
│   ├── helpers.ts           # Utility functions
│   ├── precheck.ts          # Initial setup and validation
│   ├── types.ts             # TypeScript type definitions
│   └── store/
│       ├── database.ts      # SQLite database operations
│       ├── readers.ts       # Data reading utilities
│       └── types.ts         # Database types
├── credentials/
│   ├── keys.txt             # Private keys (one per line)
│   └── proxies.txt          # Proxy list (one per line)
└── generated/               # Output files (logs, stats, etc.)
```

## 🔑 Setup

### 1. Private Keys

Create `credentials/keys.txt` with your private keys:

```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

### 2. Proxies (Optional)

Create `credentials/proxies.txt` with your proxy list:

```
http://user:pass@proxy1.com:8080
http://user:pass@proxy2.com:8080
socks5://user:pass@proxy3.com:1080
```

### 3. Capsolver API Keys

Add your Capsolver API keys to `config.ts`:

```typescript
CAPSOLVERS: ['your_api_key_1', 'your_api_key_2']
```

## 🎯 Usage

### Available Commands

```bash
# Check wallet eligibility and amounts
pnpm start check

# Claim tokens for eligible wallets
pnpm start claim

# Auto-sell tokens to BNB after claiming
pnpm start sell

# View statistics and summary
pnpm start stats

# Test mode (processes first 6 wallets)
pnpm start test

# Process specific wallet by address or index
pnpm start claim 0x1234...abcd
pnpm start claim 5
```

### Interactive Mode

Run without arguments for interactive mode:

```bash
pnpm start
```

## 📊 Statistics

The tool provides comprehensive statistics including:

- Total eligible wallets
- Claimed vs unclaimed amounts
- Current SAH token price
- Success rates
- Processing times
- Estimated USD value

## 🔧 Advanced Features

### Multi-threading

Configure concurrent wallet processing:

```typescript
THREADS: 5,  // Process 5 wallets simultaneously
```

### Proxy Rotation

The tool automatically:

- Validates proxy connectivity
- Rotates proxies for load balancing
- Blacklists failed proxies
- Uses country-based proxy selection

### Smart Claiming

- Detects unlocked claim stages
- Validates eligibility before claiming
- Handles multiple claim stages
- Automatic gas estimation

### Token Swapping

Integrated Odos DEX features:

- Automatic slippage protection
- Gas price optimization
- Minimum amount thresholds
- Transaction simulation before execution

## 🛠️ Development

### Building

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Testing

```bash
pnpm test
```

## 📝 Logging

The tool provides detailed logging with:

- Color-coded output
- Wallet-specific prefixes
- Progress indicators
- Error tracking
- Transaction confirmations

Logs are saved to:

- `generated/errors.txt` - Error details
- `generated/eligible.txt` - Eligible wallet addresses

## ⚠️ Important Notes

1. **Security**: Never share your private keys or config files
2. **Gas Fees**: Ensure wallets have sufficient BNB for gas fees
3. **Rate Limiting**: Respect API rate limits to avoid blocks
4. **Proxy Quality**: Use high-quality proxies for better success rates
5. **Backup**: Always backup your wallet data before running

## 🐛 Troubleshooting

### Common Issues

1. **"Private key not found"**

   - Check `credentials/keys.txt` format
   - Ensure keys are valid hex strings

2. **"Proxy validation failed"**

   - Verify proxy format and credentials
   - Check proxy connectivity

3. **"Captcha solving failed"**

   - Verify Capsolver API keys
   - Check API key balance

4. **"Insufficient gas fee"**
   - Add BNB to wallet for gas fees
   - Check gas price settings

### Debug Mode

Enable verbose logging by setting `SPINNER: false` in config.

## 📄 License

ISC License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚡ Performance Tips

- Use high-quality proxies for better success rates
- Adjust thread count based on your system capabilities
- Monitor gas prices for optimal transaction timing
- Use multiple Capsolver keys for better captcha solving

---

**Disclaimer**: This tool is for educational purposes. Use at your own risk and ensure compliance with all applicable laws and regulations.
