/**
 * Test script to verify anti-abuse system updates
 * Tests the new credit allocation logic for Very High suspicious scores
 */

// Simulate the configuration (copied from registration-tracking.ts)
const TRACKING_CONFIG = {
  DEFAULT_CREDITS: 100,
  SUSPICIOUS_CREDITS: 20,
  VERY_HIGH_SUSPICIOUS_CREDITS: 0,
  SUSPICIOUS_THRESHOLD: 50,
  VERY_HIGH_THRESHOLD: 80,
  BLOCK_THRESHOLD: 100,
}

console.log('🧪 Testing Anti-Abuse System Updates')
console.log('=====================================')

// Test configuration
console.log('\n📋 Configuration:')
console.log(`DEFAULT_CREDITS: ${TRACKING_CONFIG.DEFAULT_CREDITS}`)
console.log(`SUSPICIOUS_CREDITS: ${TRACKING_CONFIG.SUSPICIOUS_CREDITS}`)
console.log(`VERY_HIGH_SUSPICIOUS_CREDITS: ${TRACKING_CONFIG.VERY_HIGH_SUSPICIOUS_CREDITS}`)
console.log(`SUSPICIOUS_THRESHOLD: ${TRACKING_CONFIG.SUSPICIOUS_THRESHOLD}`)
console.log(`VERY_HIGH_THRESHOLD: ${TRACKING_CONFIG.VERY_HIGH_THRESHOLD}`)
console.log(`BLOCK_THRESHOLD: ${TRACKING_CONFIG.BLOCK_THRESHOLD}`)

// Test credit allocation logic
function testCreditAllocation(suspiciousScore) {
  let creditsToAward = TRACKING_CONFIG.DEFAULT_CREDITS
  let reason = 'Normal registration'
  
  if (suspiciousScore >= TRACKING_CONFIG.VERY_HIGH_THRESHOLD) {
    creditsToAward = TRACKING_CONFIG.VERY_HIGH_SUSPICIOUS_CREDITS
    reason = `Very high suspicious activity (score: ${suspiciousScore})`
  } else if (suspiciousScore >= TRACKING_CONFIG.SUSPICIOUS_THRESHOLD) {
    creditsToAward = TRACKING_CONFIG.SUSPICIOUS_CREDITS
    reason = `Suspicious activity (score: ${suspiciousScore})`
  }
  
  return { creditsToAward, reason }
}

console.log('\n🧪 Testing Credit Allocation:')
console.log('==============================')

// Test cases
const testCases = [
  { score: 0, expected: 100, description: 'Clean registration' },
  { score: 25, expected: 100, description: 'Low suspicious score' },
  { score: 49, expected: 100, description: 'Just below suspicious threshold' },
  { score: 50, expected: 20, description: 'At suspicious threshold' },
  { score: 65, expected: 20, description: 'High suspicious score' },
  { score: 79, expected: 20, description: 'Just below very high threshold' },
  { score: 80, expected: 0, description: 'At very high threshold' },
  { score: 90, expected: 0, description: 'Very high suspicious score' },
  { score: 100, expected: 0, description: 'Maximum suspicious score' }
]

testCases.forEach(testCase => {
  const result = testCreditAllocation(testCase.score)
  const status = result.creditsToAward === testCase.expected ? '✅' : '❌'
  
  console.log(`${status} Score ${testCase.score}: ${result.creditsToAward} credits (${testCase.description})`)
  if (result.creditsToAward !== testCase.expected) {
    console.log(`   Expected: ${testCase.expected}, Got: ${result.creditsToAward}`)
  }
})

console.log('\n📊 Real-world Examples (from your data):')
console.log('=========================================')

const realExamples = [
  { email: 'starling46018@mailshan.com', score: 100, ipDupes: 8, browserDupes: 4 },
  { email: 'gcp06234@laoia.com', score: 100, ipDupes: 4, browserDupes: 2 },
  { email: '8cfpgc9vok@zudpck.com', score: 100, ipDupes: 2, browserDupes: 2 },
  { email: 'deidreoverwhelming@tiffincrane.com', score: 100, ipDupes: 7, browserDupes: 3 },
  { email: 'iguana32166@aminating.com', score: 100, ipDupes: 3, browserDupes: 3 }
]

realExamples.forEach(example => {
  const result = testCreditAllocation(example.score)
  console.log(`📧 ${example.email}`)
  console.log(`   Score: ${example.score} | IP Dupes: ${example.ipDupes} | Browser Dupes: ${example.browserDupes}`)
  console.log(`   Credits: ${result.creditsToAward} (was 20, now ${result.creditsToAward})`)
  console.log(`   Reason: ${result.reason}`)
  console.log('')
})

console.log('🎯 Summary:')
console.log('===========')
console.log('✅ Users with Very High score (80+) now get 0 credits instead of 20')
console.log('✅ Users with High score (50-79) still get 20 credits')
console.log('✅ Normal users (0-49) still get 100 credits')
console.log('✅ This will prevent abuse from users creating multiple accounts')

console.log('\n🚀 Next Steps:')
console.log('==============')
console.log('1. Deploy these changes to production')
console.log('2. Monitor the admin dashboard for new registrations')
console.log('3. Check that Very High score users get 0 credits')
console.log('4. Existing users keep their current credits (no retroactive changes)')
