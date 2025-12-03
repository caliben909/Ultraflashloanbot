/**
 * CLIENT-SIDE SAFETY MEASURES FOR VULNERABLE SMART CONTRACT
 * These protections mitigate risks when using the old deployed contract
 */

const SAFETY_CONFIG = {
    maxSlippageTolerance: 50, // 5% max slippage
    maxGasPrice: 1000, // 1000 gwei max
    maxTradeSize: 10000, // $10k max per trade in test mode
    authorizedFlashloanProviders: [
        '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', // Aave V3 Pool
        '0x89d065572136814230A55DdEeDDEC9DF34EB0B76', // Venus Pool
        '0x470fBfb1e62D0c1c0c5b6d3b5e5e5e5e5e5e5e5', // Equalizer
        '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap V3 Factory
        '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'  // PancakeSwap Factory
    ],
    circuitBreaker: {
        consecutiveFailures: 0,
        maxFailures: 3,
        isActive: false
    },
    testMode: {
        enabled: true,
        maxTestTrades: 5,
        completedTrades: 0,
        maxTestAmount: 500 // $500 max in test mode
    }
};

// Emergency stop functionality
function emergencyStop(reason) {
    console.error(`🚨 EMERGENCY STOP ACTIVATED: ${reason}`);
    SAFETY_CONFIG.circuitBreaker.isActive = true;

    // Log emergency stop
    console.error('🔴 Bot operations halted due to safety violation');
    console.error('📊 Safety Status:', {
        consecutiveFailures: SAFETY_CONFIG.circuitBreaker.consecutiveFailures,
        testTradesCompleted: SAFETY_CONFIG.testMode.completedTrades,
        circuitBreakerActive: SAFETY_CONFIG.circuitBreaker.isActive
    });

    // In a real implementation, you might want to:
    // - Send alert notifications
    // - Log to external monitoring service
    // - Pause all operations
    // - Notify administrators

    throw new Error(`EMERGENCY STOP: ${reason}`);
}

// Circuit breaker check
function checkCircuitBreaker() {
    if (SAFETY_CONFIG.circuitBreaker.consecutiveFailures >= SAFETY_CONFIG.circuitBreaker.maxFailures) {
        emergencyStop('Too many consecutive failures');
    }

    if (SAFETY_CONFIG.circuitBreaker.isActive) {
        emergencyStop('Circuit breaker manually activated');
    }
}

// Validate flashloan provider (client-side protection)
function validateFlashloanProvider(providerAddress) {
    if (!SAFETY_CONFIG.authorizedFlashloanProviders.includes(providerAddress)) {
        emergencyStop(`Unauthorized flashloan provider: ${providerAddress}`);
    }
    console.log(`✅ Validated flashloan provider: ${providerAddress}`);
}

// Safe slippage calculation
function calculateSafeSlippage(amountIn, expectedOut) {
    const safeMinOut = expectedOut * (10000 - SAFETY_CONFIG.maxSlippageTolerance) / 10000;
    console.log(`🛡️ Applied ${SAFETY_CONFIG.maxSlippageTolerance/100}% slippage protection: ${expectedOut} → ${safeMinOut}`);
    return safeMinOut;
}

// Safe approval with limits
function safeApprove(tokenContract, spender, amount) {
    const MAX_APPROVAL = amount * 1.1; // 110% of needed amount only
    console.log(`🛡️ Safe approval: ${amount} → ${MAX_APPROVAL} (limited)`);
    return tokenContract.approve(spender, MAX_APPROVAL);
}

// Transaction safety validation
function validateTransaction(txData) {
    // Gas price check
    if (txData.gasPrice && txData.gasPrice > SAFETY_CONFIG.maxGasPrice) {
        emergencyStop(`Gas price too high: ${txData.gasPrice} gwei > ${SAFETY_CONFIG.maxGasPrice} gwei`);
    }

    // Trade size check
    if (txData.amount) {
        const maxAllowed = SAFETY_CONFIG.testMode.enabled ?
            SAFETY_CONFIG.testMode.maxTestAmount :
            SAFETY_CONFIG.maxTradeSize;

        if (txData.amount > maxAllowed) {
            emergencyStop(`Trade size too large: $${txData.amount} > $${maxAllowed}`);
        }
    }

    // Test mode limits
    if (SAFETY_CONFIG.testMode.enabled) {
        if (SAFETY_CONFIG.testMode.completedTrades >= SAFETY_CONFIG.testMode.maxTestTrades) {
            emergencyStop('Test mode limit reached - manual review required');
        }
    }
}

// Monitored transaction wrapper
async function monitoredTransaction(txPromise, txDescription = 'transaction') {
    try {
        console.log(`🔍 Monitoring ${txDescription}...`);
        const result = await txPromise;

        // Reset failure counter on success
        SAFETY_CONFIG.circuitBreaker.consecutiveFailures = 0;

        // Track test trades
        if (SAFETY_CONFIG.testMode.enabled) {
            SAFETY_CONFIG.testMode.completedTrades++;
            console.log(`📊 Test trade ${SAFETY_CONFIG.testMode.completedTrades}/${SAFETY_CONFIG.testMode.maxTestTrades} completed`);
        }

        console.log(`✅ ${txDescription} successful`);
        return result;
    } catch (error) {
        SAFETY_CONFIG.circuitBreaker.consecutiveFailures++;
        console.error(`❌ ${txDescription} failed:`, error.message);
        checkCircuitBreaker();
        throw error;
    }
}

// Get safety status
function getSafetyStatus() {
    return {
        circuitBreaker: SAFETY_CONFIG.circuitBreaker,
        testMode: SAFETY_CONFIG.testMode,
        limits: {
            maxSlippage: SAFETY_CONFIG.maxSlippageTolerance / 100,
            maxGasPrice: SAFETY_CONFIG.maxGasPrice,
            maxTradeSize: SAFETY_CONFIG.testMode.enabled ? SAFETY_CONFIG.testMode.maxTestAmount : SAFETY_CONFIG.maxTradeSize
        },
        authorizedProviders: SAFETY_CONFIG.authorizedFlashloanProviders
    };
}

// Manual circuit breaker activation
function activateCircuitBreaker() {
    SAFETY_CONFIG.circuitBreaker.isActive = true;
    console.warn('⚠️ Circuit breaker manually activated');
}

// Deactivate circuit breaker (use with caution)
function deactivateCircuitBreaker() {
    SAFETY_CONFIG.circuitBreaker.isActive = false;
    SAFETY_CONFIG.circuitBreaker.consecutiveFailures = 0;
    console.warn('⚠️ Circuit breaker manually deactivated - USE WITH CAUTION');
}

// Disable test mode (enable production mode)
function disableTestMode() {
    SAFETY_CONFIG.testMode.enabled = false;
    console.warn('⚠️ Test mode disabled - PRODUCTION MODE ACTIVATED');
}

module.exports = {
    emergencyStop,
    checkCircuitBreaker,
    validateFlashloanProvider,
    calculateSafeSlippage,
    safeApprove,
    validateTransaction,
    monitoredTransaction,
    getSafetyStatus,
    activateCircuitBreaker,
    deactivateCircuitBreaker,
    disableTestMode,
    SAFETY_CONFIG
};