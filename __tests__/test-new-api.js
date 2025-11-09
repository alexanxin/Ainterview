// Test the new invitation codes API
// Run this in your browser console to test

async function testNewInvitationCode() {
    console.log('🧪 Testing new invitation codes API...');

    const code = '53TOTCQ4'; // Your test code

    try {
        // Test the NEW API endpoint (POST, not GET!)
        const response = await fetch('/api/invitation-codes/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code })
        });

        console.log('📡 Response status:', response.status);

        const data = await response.json();
        console.log('📦 Response data:', data);

        if (response.ok && data.valid) {
            console.log('✅ Code is valid and working!');
            console.log('📊 Code info:', data.codeInfo);
        } else {
            console.log('❌ Code validation failed:', data.error);
        }

    } catch (error) {
        console.error('💥 Network error:', error);
    }
}

// Make it available in console
if (typeof window !== 'undefined') {
    window.testNewInvitationCode = testNewInvitationCode;
    console.log('🔧 Test function ready: testNewInvitationCode()');
}

// Test immediately
testNewInvitationCode();