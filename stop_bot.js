#!/usr/bin/env node

/**
 * STOP SCRIPT FOR CALI FLASHLOAN ARBITRAGE BOT
 * Gracefully stops the bot with safety measures
 */

const fs = require('fs');
const path = require('path');

// Bot process management
const BOT_PID_FILE = path.join(__dirname, 'bot.pid');

function readPidFile() {
    try {
        if (fs.existsSync(BOT_PID_FILE)) {
            const pid = parseInt(fs.readFileSync(BOT_PID_FILE, 'utf8').trim());
            return pid;
        }
    } catch (error) {
        console.error('❌ Error reading PID file:', error.message);
    }
    return null;
}

function writePidFile(pid) {
    try {
        fs.writeFileSync(BOT_PID_FILE, pid.toString());
    } catch (error) {
        console.error('❌ Error writing PID file:', error.message);
    }
}

function removePidFile() {
    try {
        if (fs.existsSync(BOT_PID_FILE)) {
            fs.unlinkSync(BOT_PID_FILE);
        }
    } catch (error) {
        console.error('❌ Error removing PID file:', error.message);
    }
}

function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        return false;
    }
}

async function stopBot() {
    console.log('🛑 CALI FLASHLOAN ARBITRAGE BOT STOP SEQUENCE');
    console.log('===============================================');
    console.log(`⏰ Stop Time: ${new Date().toISOString()}`);
    console.log('');

    // Check if PID file exists
    const pid = readPidFile();
    if (!pid) {
        console.log('ℹ️  No PID file found - bot may not be running');
        console.log('🔍 Checking for running bot processes...');

        // Try to find running bot processes
        try {
            const { execSync } = require('child_process');
            const result = execSync('pgrep -f "launch_bot.js"', { encoding: 'utf8' }).trim();
            if (result) {
                const pids = result.split('\n').map(p => parseInt(p));
                console.log(`📋 Found ${pids.length} potential bot process(es): ${pids.join(', ')}`);

                // Stop all found processes
                for (const foundPid of pids) {
                    try {
                        process.kill(foundPid, 'SIGTERM');
                        console.log(`✅ Sent SIGTERM to process ${foundPid}`);
                    } catch (error) {
                        console.log(`⚠️  Could not stop process ${foundPid}: ${error.message}`);
                    }
                }

                // Wait a moment for graceful shutdown
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Check if processes are still running
                let stillRunning = 0;
                for (const foundPid of pids) {
                    if (isProcessRunning(foundPid)) {
                        stillRunning++;
                        try {
                            process.kill(foundPid, 'SIGKILL');
                            console.log(`💀 Force killed process ${foundPid}`);
                        } catch (error) {
                            console.log(`❌ Could not force kill process ${foundPid}: ${error.message}`);
                        }
                    }
                }

                if (stillRunning === 0) {
                    console.log('✅ All bot processes stopped successfully');
                } else {
                    console.log(`⚠️  ${stillRunning} process(es) may still be running`);
                }
            } else {
                console.log('✅ No bot processes found running');
            }
        } catch (error) {
            console.log('ℹ️  Could not check for running processes (pgrep not available)');
            console.log('💡 Try manually killing Node.js processes:');
            console.log('   Linux/Mac: pkill -f "launch_bot.js"');
            console.log('   Windows: taskkill /F /IM node.exe /FI "WINDOWTITLE eq launch_bot.js"');
        }

        removePidFile();
        return;
    }

    console.log(`📋 Found bot PID: ${pid}`);

    // Check if process is actually running
    if (!isProcessRunning(pid)) {
        console.log(`⚠️  Process ${pid} is not running`);
        removePidFile();
        return;
    }

    console.log(`🔄 Stopping bot process ${pid}...`);

    try {
        // Send SIGTERM for graceful shutdown
        process.kill(pid, 'SIGTERM');
        console.log('✅ Sent graceful shutdown signal (SIGTERM)');

        // Wait for graceful shutdown
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts && isProcessRunning(pid)) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
            console.log(`⏳ Waiting for graceful shutdown... (${attempts}/${maxAttempts})`);
        }

        if (isProcessRunning(pid)) {
            console.log('⚠️  Graceful shutdown timeout - force killing...');
            process.kill(pid, 'SIGKILL');
            console.log('💀 Force killed bot process');
        } else {
            console.log('✅ Bot stopped gracefully');
        }

    } catch (error) {
        console.error('❌ Error stopping bot:', error.message);

        // Try force kill as fallback
        try {
            process.kill(pid, 'SIGKILL');
            console.log('💀 Force killed bot process (fallback)');
        } catch (forceKillError) {
            console.error('❌ Could not force kill bot:', forceKillError.message);
        }
    }

    // Clean up PID file
    removePidFile();
    console.log('🧹 Cleaned up PID file');

    console.log('');
    console.log('✅ BOT STOP SEQUENCE COMPLETE');
    console.log('================================');
    console.log('💡 Tips:');
    console.log('   • Check logs for final statistics');
    console.log('   • Verify wallet balance');
    console.log('   • Review safety status');
    console.log('   • Run safety tests: node test_safety_measures.js');
}

async function getBotStatus() {
    console.log('📊 CALI FLASHLOAN ARBITRAGE BOT STATUS');
    console.log('=====================================');

    const pid = readPidFile();
    if (pid) {
        console.log(`📋 PID File: ${pid}`);
        if (isProcessRunning(pid)) {
            console.log('🟢 Status: RUNNING');
        } else {
            console.log('🔴 Status: STOPPED (stale PID file)');
            console.log('💡 Run: node stop_bot.js --cleanup');
        }
    } else {
        console.log('📋 PID File: Not found');
        console.log('🔴 Status: NOT RUNNING');
    }

    // Check for any running bot processes
    try {
        const { execSync } = require('child_process');
        const result = execSync('pgrep -f "launch_bot.js"', { encoding: 'utf8' }).trim();
        if (result) {
            const pids = result.split('\n');
            console.log(`🔍 Running bot processes: ${pids.join(', ')}`);
        }
    } catch (error) {
        // pgrep not available or no processes found
    }

    console.log('');
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Cali Flashloan Arbitrage Bot Stop Script

USAGE:
  node stop_bot.js [options]

OPTIONS:
  --help, -h          Show this help message
  --status           Check bot status without stopping
  --cleanup          Remove stale PID file
  --force            Force kill without graceful shutdown

EXAMPLES:
  node stop_bot.js                 # Graceful stop
  node stop_bot.js --status       # Check status only
  node stop_bot.js --force        # Force kill immediately
  node stop_bot.js --cleanup      # Clean up stale files

SIGNALS:
  The script sends SIGTERM first for graceful shutdown,
  then SIGKILL if the process doesn't respond within 10 seconds.

SAFETY:
  Always prefer graceful shutdown to preserve bot state
  and ensure proper cleanup of resources.
        `);
        process.exit(0);
    }

    if (args.includes('--status')) {
        getBotStatus();
        process.exit(0);
    }

    if (args.includes('--cleanup')) {
        console.log('🧹 Cleaning up stale PID file...');
        removePidFile();
        console.log('✅ Cleanup complete');
        process.exit(0);
    }

    // Stop the bot
    stopBot().catch((error) => {
        console.error('💥 Fatal error during stop:', error);
        process.exit(1);
    });
}

module.exports = { stopBot, getBotStatus, readPidFile, writePidFile, removePidFile };