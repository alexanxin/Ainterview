import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function testPaymentRecords() {
    console.log('🚀 Testing Payment Records functionality...\n');

    try {
        // First, let's check if the payment_records table exists and get a valid user ID
        console.log('Checking database setup...');

        // Get a valid user ID from existing data
        const { data: existingUsers, error: usersError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        let testUserId = '12345678-1234-1234-1234-123456789012'; // Default mock ID

        if (!usersError && existingUsers && existingUsers.length > 0) {
            testUserId = existingUsers[0].id;
            console.log('✅ Using existing user ID:', testUserId);
        } else {
            console.log('⚠️ No existing users found, using mock user ID (this may fail due to foreign key constraint)');
        }

        // Test 1: Insert a pending payment record
        console.log('Test 1: Inserting pending payment record...');
        const testTransactionId = `test_tx_${Date.now()}`;

        const { data: insertData, error: insertError } = await supabase
            .from('payment_records')
            .insert({
                user_id: testUserId,
                transaction_id: testTransactionId,
                expected_amount: 5.0,
                token: 'PYUSD',
                recipient: '9JZqmA1gq87Kbqv2cQCiDQ7Ne57UNRVsPVc3d1eRCeVy',
                status: 'pending'
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Failed to insert payment record:', insertError);
            return;
        }

        console.log('✅ Payment record inserted successfully:', insertData);
        console.log('');

        // Test 2: Update the record to confirmed
        console.log('Test 2: Updating payment record to confirmed...');
        const { error: updateError } = await supabase
            .from('payment_records')
            .update({ status: 'confirmed' })
            .eq('transaction_id', testTransactionId);

        if (updateError) {
            console.error('❌ Failed to update payment record:', updateError);
            return;
        }

        console.log('✅ Payment record updated to confirmed');
        console.log('');

        // Test 3: Query the record
        console.log('Test 3: Querying payment record...');
        const { data: queryData, error: queryError } = await supabase
            .from('payment_records')
            .select('*')
            .eq('transaction_id', testTransactionId)
            .single();

        if (queryError) {
            console.error('❌ Failed to query payment record:', queryError);
            return;
        }

        console.log('✅ Payment record retrieved:', queryData);
        console.log('');

        // Test 4: Update to failed status
        console.log('Test 4: Updating payment record to failed...');
        const { error: failError } = await supabase
            .from('payment_records')
            .update({ status: 'failed' })
            .eq('transaction_id', testTransactionId);

        if (failError) {
            console.error('❌ Failed to update payment record to failed:', failError);
            return;
        }

        console.log('✅ Payment record updated to failed');
        console.log('');

        // Test 5: List all payment records for the test user
        console.log('Test 5: Listing all payment records for test user...');
        const { data: listData, error: listError } = await supabase
            .from('payment_records')
            .select('*')
            .eq('user_id', testUserId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (listError) {
            console.error('❌ Failed to list payment records:', listError);
            return;
        }

        console.log(`✅ Found ${listData.length} payment record(s):`);
        listData.forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.transaction_id} - ${record.status} (${record.expected_amount} ${record.token})`);
        });

        console.log('\n🎉 All payment records tests completed successfully!');

    } catch (error) {
        console.error('❌ Unexpected error during payment records test:', error);
    }
}

// Run the test
testPaymentRecords();