# 🚀 BOT LAUNCH & CONTROL SCRIPTS

## Quick Start Commands

### Launch the Bot
```bash
node launch_bot.js
```

### Stop the Bot
```bash
node stop_bot.js
```

### Check Bot Status
```bash
node bot_status.js
```

### Test Safety Measures
```bash
node test_safety_measures.js
```

---

## 📋 Detailed Usage

### 1. Launch Script (`launch_bot.js`)

**Basic Launch:**
```bash
node launch_bot.js
```

**Options:**
- `--help, -h` - Show help message
- `--dry-run` - Validate configuration without starting
- `--test-mode` - Force test mode (small amounts)
- `--production` - Force production mode (full amounts)

**Environment Variables:**
```bash
# Required
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://bsc-dataseed.binance.org/

# Optional
MIN_PROFIT_USD=0.1              # Minimum profit threshold ($0.10)
MAX_GAS_PRICE_GWEI=10           # Maximum gas price (10 gwei)
SCAN_INTERVAL_MS=5000           # Scanning interval (5 seconds)
NODEREAL_API_KEY=your_api_key   # For MEV protection
```

### 2. Stop Script (`stop_bot.js`)

**Graceful Stop:**
```bash
node stop_bot.js
```

**Options:**
- `--help, -h` - Show help message
- `--status` - Check bot status without stopping
- `--cleanup` - Remove stale PID file
- `--force` - Force kill without graceful shutdown

### 3. Status Script (`bot_status.js`)

**Check Status:**
```bash
node bot_status.js
```

**Options:**
- `--help, -h` - Show help message
- `--json` - Output status as JSON
- `--watch` - Continuously monitor status (every 30 seconds)

---

## 🛡️ Safety Features

### Test Mode (Default)
- **Trade Limit**: $500 per trade maximum
- **Test Trades**: 5 trades maximum
- **Enhanced Monitoring**: All transactions logged
- **Circuit Breaker**: Auto-stop after 3 failures

### Production Mode
- **Trade Limit**: $10,000 per trade maximum
- **No Test Limits**: Full operation
- **Same Safety**: Circuit breaker and monitoring active

### Emergency Controls
- **Ctrl+C**: Graceful shutdown
- **Circuit Breaker**: Auto-stop on failures
- **Gas Limits**: Prevent overpayment
- **Slippage Protection**: 5% maximum slippage

---

## 📊 Status Indicators

### Bot Status
- 🟢 **RUNNING**: Bot is active and scanning
- 🔴 **STOPPED**: Bot is not running
- 🟡 **ERROR**: Bot encountered issues

### Safety Status
- 🟢 **ACTIVE**: All safety measures working
- 🟡 **WARNING**: Some issues detected
- 🔴 **CRITICAL**: Safety measures compromised

### Environment
- ✅ **Set**: Environment variable configured
- ❌ **Not set**: Environment variable missing

---

## 🔧 Configuration

### Required Setup

1. **Private Key** (Required):
   ```bash
   PRIVATE_KEY=0x_your_private_key_here
   ```

2. **RPC URL** (Required):
   ```bash
   RPC_URL=https://bsc-dataseed.binance.org/
   ```

3. **Nodereal API Key** (Recommended for MEV protection):
   ```bash
   NODEREAL_API_KEY=your_nodereal_api_key
   ```

### Optional Configuration

```bash
# Profit thresholds
MIN_PROFIT_USD=0.1

# Gas settings
MAX_GAS_PRICE_GWEI=10

# Scanning frequency
SCAN_INTERVAL_MS=5000
```

---

## 🚨 Emergency Procedures

### If Bot Won't Stop
```bash
# Force kill all bot processes
node stop_bot.js --force

# Or manually kill processes
pkill -f "launch_bot.js"
```

### If Safety Measures Trigger
1. **Check status**: `node bot_status.js`
2. **Review logs**: Check console output
3. **Test safety**: `node test_safety_measures.js`
4. **Manual reset**: `node stop_bot.js --cleanup`

### If Circuit Breaker Activates
- Bot automatically stops
- Check for configuration issues
- Review recent transaction failures
- Restart with `node launch_bot.js`

---

## 📈 Monitoring

### Real-time Status
```bash
node bot_status.js --watch
```

### Safety Verification
```bash
node test_safety_measures.js
```

### Performance Metrics
- Check console output for trade statistics
- Monitor gas prices and success rates
- Review profit/loss tracking

---

## 💡 Best Practices

### Before Starting
1. **Test safety measures**: `node test_safety_measures.js`
2. **Check configuration**: `node bot_status.js`
3. **Verify balance**: Ensure sufficient BNB for gas
4. **Backup wallet**: Secure private key storage

### During Operation
1. **Monitor status**: Regular status checks
2. **Watch logs**: Review console output
3. **Check balance**: Ensure gas funds available
4. **Emergency ready**: Know stop commands

### After Stopping
1. **Review statistics**: Check final trade results
2. **Verify balance**: Confirm funds are safe
3. **Clean up**: Remove PID files if needed
4. **Backup logs**: Save important data

---

## 🔍 Troubleshooting

### Bot Won't Start
```bash
# Check environment
node bot_status.js

# Validate safety
node test_safety_measures.js

# Check logs for errors
```

### Bot Stops Unexpectedly
```bash
# Check circuit breaker
node bot_status.js

# Review safety status
node test_safety_measures.js

# Check gas prices and balance
```

### Performance Issues
- Reduce scan interval
- Increase profit thresholds
- Check RPC connection
- Monitor gas prices

---

## 📞 Support

**Quick Commands Reference:**
```bash
# Start operations
node launch_bot.js              # Start bot
node bot_status.js              # Check status
node test_safety_measures.js    # Test safety

# Stop operations
node stop_bot.js                # Graceful stop
node stop_bot.js --force        # Force stop
node stop_bot.js --cleanup      # Clean stale files

# Monitoring
node bot_status.js --watch      # Continuous monitoring
```

**Emergency Contacts:**
- Check logs for error details
- Verify wallet balance
- Test safety measures
- Review configuration

---

## ✅ Safety First

**Remember**: The bot includes multiple safety layers:
- Test mode limits ($500/trade, 5 trades max)
- Circuit breaker (auto-stop after 3 failures)
- Gas price limits (1000 gwei max)
- Slippage protection (5% max)
- Emergency stop (Ctrl+C)

**Always test with small amounts first!** 🛡️