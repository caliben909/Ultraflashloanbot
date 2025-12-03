#!/usr/bin/env node

/**
 * STATUS SCRIPT FOR CALI FLASHLOAN ARBITRAGE BOT
 * Displays comprehensive bot status and safety information
 */

const fs = require('fs');
const path = require('path');
const { getSafetyStatus } = require('./utils/SafetyWrapper');

// Bot PID file
const BOT_PID_FILE = path.join(__dirname, 'bot.pid');

function readPidFile() {
    try {
        if (fs.existsSync(BOT_PID_FILE)) {
            return parseInt(fs.readFileSync(BOT_PID_FILE, 'utf8').trim());
        }
    } catch (error) {
        console.error('❌ Error reading PID file:', error.message);
    }
    return null;
}

function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        return false;
    }
}

async function getBotStatus() {
    console.log('📊 CALI FLASHLOAN ARBITRAGE BOT STATUS');
    console.log('=====================================');
    console.log(`⏰ Report Time: ${new Date().toISOString()}`);
    console.log('');

    // Check PID file and process status
    const pid = readPidFile();
    if (pid) {
        console.log(`📋 PID File: ${pid}`);
        if (isProcessRunning(pid)) {
            console.log('🟢 Bot Status: RUNNING');
        } else {
            console.log('🔴 Bot Status: STOPPED (stale PID file)');
            console.log('💡 Recommendation: Run "node stop_bot.js --cleanup"');
        }
    } else {
        console.log('📋 PID File: Not found');
        console.log('🔴 Bot Status: NOT RUNNING');
    }

    // Check for any running bot processes
    try {
        const { execSync } = require('child_process');
        const result = execSync('pgrep -f "launch_bot.js"', { encoding: 'utf8' }).trim();
        if (result) {
            const pids = result.split('\n').filter(p => p.trim());
            console.log(`🔍 Running Bot Processes: ${pids.length} found`);
            pids.forEach(p => console.log(`   • PID ${p}`));
        } else {
            console.log('🔍 Running Bot Processes: None found');
        }
    } catch (error) {
        console.log('🔍 Running Bot Processes: Unable to check (pgrep not available)');
    }

    console.log('');

    // Safety Status
    console.log('🛡️ SAFETY STATUS');
    console.log('================');
    const safetyStatus = getSafetyStatus();
    console.log(`Test Mode: ${safetyStatus.testMode.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}`);
    console.log(`Circuit Breaker: ${safetyStatus.circuitBreaker.isActive ? '🔴 ACTIVE' : '🟢 Ready'}`);
    console.log(`Consecutive Failures: ${safetyStatus.circuitBreaker.consecutiveFailures}/${safetyStatus.circuitBreaker.maxFailures}`);
    console.log(`Max Trade Size: $${safetyStatus.limits.maxTradeSize}`);
    console.log(`Max Gas Price: ${safetyStatus.limits.maxGasPrice} gwei`);
    console.log(`Slippage Protection: ${safetyStatus.limits.maxSlippage * 100}% maximum`);
    console.log(`Test Trades Completed: ${safetyStatus.testMode.completedTrades}/${safetyStatus.testMode.maxTestTrades}`);
    console.log('');

    // Environment Check
    console.log('🌐 ENVIRONMENT CHECK');
    console.log('====================');
    const envVars = [
        'PRIVATE_KEY',
        'RPC_URL',
        'NODEREAL_RPC',
        'NODEREAL_API_KEY',
        'MIN_PROFIT_USD',
        'MAX_GAS_PRICE_GWEI',
        'SCAN_INTERVAL_MS'
    ];

    envVars.forEach(varName => {
        const value = process.env[varName];
        const status = value && value !== 'your_nodereal_api_key_here' ? '✅' : '❌';
        console.log(`${status} ${varName}: ${value ? 'Set' : 'Not set'}`);
    });

    console.log('');

    // Blockchain Connection Check
    console.log('🔗 BLOCKCHAIN CONNECTION');
    console.log('========================');
    try {
        const { ethers } = require('ethers');
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'https://bsc-dataseed.binance.org/');
        const blockNumber = await provider.getBlockNumber();
        const gasPrice = await provider.getGasPrice();

        console.log(`✅ Connected to blockchain`);
        console.log(`📊 Current block: ${blockNumber}`);
        console.log(`⛽ Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);

        // Check wallet if private key is available
        if (process.env.PRIVATE_KEY) {
            const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
            const balance = await signer.getBalance();
            console.log(`💰 Wallet balance: ${ethers.utils.formatEther(balance)} BNB ($${parseFloat(ethers.utils.formatEther(balance)) * 567})`);
            console.log(`📍 Wallet address: ${signer.address}`);
        } else {
            console.log('⚠️  Private key not configured');
        }
    } catch (error) {
        console.log(`❌ Blockchain connection failed: ${error.message}`);
    }

    console.log('');

    // Recommendations
    console.log('💡 RECOMMENDATIONS');
    console.log('==================');

    if (!pid || !isProcessRunning(pid)) {
        console.log('• Bot is not running - use "node launch_bot.js" to start');
    }

    if (safetyStatus.testMode.enabled && safetyStatus.testMode.completedTrades >= safetyStatus.testMode.maxTestTrades) {
        console.log('• Test mode limit reached - review results before production');
    }

    if (safetyStatus.circuitBreaker.consecutiveFailures > 0) {
        console.log(`• ${safetyStatus.circuitBreaker.consecutiveFailures} recent failures - check logs`);
    }

    if (!process.env.NODEREAL_API_KEY || process.env.NODEREAL_API_KEY === 'your_nodereal_api_key_here') {
        console.log('• Nodereal MEV protection not configured - reduced protection');
    }

    if (!process.env.PRIVATE_KEY) {
        console.log('• Private key not configured - cannot start bot');
    }

    console.log('');
    console.log('📋 QUICK COMMANDS');
    console.log('=================');
    console.log('Start bot:    node launch_bot.js');
    console.log('Stop bot:     node stop_bot.js');
    console.log('Bot status:   node bot_status.js');
    console.log('Safety test:  node test_safety_measures.js');
    console.log('Nodereal test: node test_nodereal_integration.js');
    console.log('');
}

// Handle command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Cali Flashloan Arbitrage Bot Status Checker

USAGE:
  node bot_status.js [options]

OPTIONS:
  --help, -h          Show this help message
  --json             Output status as JSON
  --watch            Continuously monitor status (every 30 seconds)

EXAMPLES:
  node bot_status.js              # Show current status
  node bot_status.js --json      # JSON output for scripts
  node bot_status.js --watch     # Continuous monitoring

STATUS INDICATORS:
  🟢 Green: Good/Active
  🟡 Yellow: Warning/Partial
  🔴 Red: Error/Inactive

SAFETY PRIORITIES:
  1. Circuit breaker status
  2. Test mode limits
  3. Environment configuration
  4. Blockchain connectivity
        `);
        process.exit(0);
    }

    if (args.includes('--json')) {
        // JSON output mode
        getBotStatus().then(() => {
            // In a real implementation, you'd collect status data and output as JSON
            console.log('{}'); // Placeholder
        });
        return;
    }

    if (args.includes('--watch')) {
        // Watch mode
        console.log('👀 Starting status watch mode (Ctrl+C to stop)');
        console.log('Updates every 30 seconds...\n');

        const watchInterval = setInterval(() => {
            console.clear();
            getBotStatus();
        }, 30000);

        // Handle exit
        process.on('SIGINT', () => {
            clearInterval(watchInterval);
            console.log('\n👋 Stopped watching');
            process.exit(0);
        });

        // Initial status
        getBotStatus();
        return;
    }

    // Default: show status once
    getBotStatus().catch((error) => {
        console.error('💥 Error getting bot status:', error);
        process.exit(1);
    });
}

module.exports = { getBotStatus, readPidFile, isProcessRunning };