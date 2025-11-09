// Simple test script for invitation codes system
// Run this in your browser console to generate and test codes

import { InvitationCodeAdmin } from '../src/lib/invitation-code-admin.js';

// Test the invitation code system
async function testInvitationCodes() {
    console.log('🚀 Testing Invitation Code System');
    console.log('=====================================');

    // 1. Generate 5 test codes
    console.log('1. Generating 5 invitation codes...');
    const result = await InvitationCodeAdmin.generateBatch(5, 'Test codes');

    if (result.success) {
        console.log('✅ Generated codes:', result.codes);
        if (result.shareableText) {
            console.log('📱 Shareable text:');
            console.log(result.shareableText);
        }
    } else {
        console.error('❌ Failed to generate codes:', result.error);
        return;
    }

    // 2. Test each code
    console.log('\n2. Testing each code...');
    for (const code of result.codes) {
        console.log(`Testing ${code.code}...`);
        const testResult = await InvitationCodeAdmin.testCode(code.code);
        if (testResult.valid) {
            console.log(`✅ ${code.code} is valid`);
        } else {
            console.log(`❌ ${code.code} failed: ${testResult.error}`);
        }
    }

    // 3. Test invalid code
    console.log('\n3. Testing invalid code...');
    const invalidResult = await InvitationCodeAdmin.testCode('INVALID');
    if (invalidResult.valid) {
        console.log('❌ This should have failed!');
    } else {
        console.log('✅ Invalid code correctly rejected:', invalidResult.error);
    }

    console.log('\n🎉 Test completed!');
}

// Make the test function available globally
if (typeof window !== 'undefined') {
    window.testInvitationCodes = testInvitationCodes;

    // Also add a simple function to generate just codes without database
    window.generateSimpleCodes = (count = 5) => {
        const codes = InvitationCodeAdmin.generateSimpleCodes(count);
        console.log('Generated codes (not in database):', codes);
        return codes;
    };

    console.log('📋 Available test functions:');
    console.log('- testInvitationCodes() - Full system test');
    console.log('- generateSimpleCodes(count) - Generate codes locally');
    console.log('\n🎯 Ready to test! Run: testInvitationCodes()');
}