// Quick test to debug the invitation code API
// Run this in your browser console to test

async function testInvitationCodeAPI() {
    console.log('🧪 Testing Invitation Code API...');

    try {
        // Test validation endpoint
        console.log('1. Testing validation endpoint...');
        const response = await fetch('/api/invitation-codes/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: 'TESTCODE' })
        });

        const data = await response.json();
        console.log('📊 Validation response:', { status: response.status, data });

        if (response.ok) {
            console.log('✅ Validation API working');
        } else {
            console.log('❌ Validation API error:', data.error);
        }

    } catch (error) {
        console.error('💥 Network error:', error);
    }
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.testInvitationCodeAPI = testInvitationCodeAPI;
    console.log('🔧 Test function ready: testInvitationCodeAPI()');
}

// Run the test
testInvitationCodeAPI();