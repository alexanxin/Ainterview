// Enhanced standalone database test script with authentication checking
// Run with: node test-database-enhanced.js

import { createClient } from '@supabase/supabase-js';

// Try to load environment variables from both .env.local and .env
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// If environment variables aren't set, try to load from .env.local (Next.js standard)
if (!supabaseUrl || !supabaseAnonKey) {
    try {
        const fs = await import('fs');
        if (fs.existsSync('.env.local')) {
            const dotenv = await import('dotenv');
            const envConfig = dotenv.default.parse(fs.readFileSync('.env.local'));
            supabaseUrl = supabaseUrl || envConfig.NEXT_PUBLIC_SUPABASE_URL;
            supabaseAnonKey = supabaseAnonKey || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        }
    } catch (err) {
        // Could not load .env.local file, proceeding with environment variables
    }
}

// Also try to load from .env if still not set
if (!supabaseUrl || !supabaseAnonKey) {
    try {
        const fs = await import('fs');
        if (fs.existsSync('.env')) {
            const dotenv = await import('dotenv');
            const envConfig = dotenv.default.parse(fs.readFileSync('.env'));
            supabaseUrl = supabaseUrl || envConfig.NEXT_PUBLIC_SUPABASE_URL;
            supabaseAnonKey = supabaseAnonKey || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        }
    } catch (err) {
        // Could not load .env file, proceeding with environment variables
    }
}

// Supabase URL: supabaseUrl ? 'SET' : 'NOT SET'
// Supabase Anon Key: supabaseAnonKey ? 'SET' : 'NOT SET'

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not properly configured!');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock user ID for testing - needs to be a valid UUID format
const TEST_USER_ID = '12345678-1234-1234-1234-123456789012';

async function testAuthentication() {
    // Testing authentication status

    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.log('❌ Failed to get session:', sessionError.message);
            return { success: false, error: sessionError };
        }

        if (!session) {
            // No active session - user not authenticated
            return { success: false, message: 'No active session' };
        }

        // User is authenticated

        return { success: true, session };
    } catch (error) {
        console.log('❌ Authentication test error:', error);
        return { success: false, error };
    }
}

async function testDatabaseOperationsWithAuthCheck() {
    // Starting database test operations with authentication check

    // First, test authentication
    const authResult = await testAuthentication();

    if (!authResult.success) {
        console.log('\n❌ Cannot proceed with database tests - authentication required');

        // Try to test direct access with service role key if available
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceRoleKey) {
            // Attempting to test with service role key (bypassing RLS)
            await testWithServiceRole(serviceRoleKey);
        } else {
            // Tip: To bypass Row Level Security for testing, set SUPABASE_SERVICE_ROLE_KEY in your environment
            // This will allow direct database access without authentication
        }

        return;
    }

    // Proceeding with authenticated database tests

    try {
        // Test 1: Insert into profiles table
        // Test 1: Inserting into profiles table
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: TEST_USER_ID,
                    email: 'test@example.com',
                    full_name: 'Test User',
                    bio: 'This is a test user for database testing',
                    experience: 'Testing experience',
                    education: 'Test education',
                    skills: 'Testing, Debugging, Development',
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (profileError) {
            if (profileError.code === '23505') { // Unique violation - profile already exists
                // Profile already exists, updating instead
                const { data: updateData, error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: 'Test User',
                        bio: 'This is a test user for database testing',
                        experience: 'Testing experience',
                        education: 'Test education',
                        skills: 'Testing, Debugging, Development',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', TEST_USER_ID)
                    .select()
                    .single();

                if (updateError) {
                    console.error('❌ Error updating profile:', updateError);
                } else {
                    // ✅ Profile updated successfully
                }
            } else {
                console.error('❌ Error inserting profile:', profileError);
            }
        } else {
            // ✅ Profile inserted successfully
        }

        // Test 2: Create Interview Session
        // Test 2: Inserting into interview_sessions table
        const { data: sessionData, error: sessionError } = await supabase
            .from('interview_sessions')
            .insert([
                {
                    user_id: TEST_USER_ID,
                    job_posting: 'Software Engineer Position',
                    company_info: 'Test Company Inc.',
                    title: 'Software Engineer Interview',
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (sessionError) {
            console.error('❌ Error inserting interview session:', sessionError);
        } else {
            // ✅ Interview session inserted successfully

            // Test 3: Create Interview Question
            // Test 3: Inserting into interview_questions table
            const { data: questionData, error: questionError } = await supabase
                .from('interview_questions')
                .insert([
                    {
                        session_id: sessionData.id,
                        question_text: 'Tell me about yourself',
                        question_number: 1,
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (questionError) {
                console.error('❌ Error inserting interview question:', questionError);
            } else {
                // ✅ Interview question inserted successfully

                // Test 4: Create Interview Answer
                // Test 4: Inserting into interview_answers table
                const { data: answerData, error: answerError } = await supabase
                    .from('interview_answers')
                    .insert([
                        {
                            question_id: questionData.id,
                            session_id: sessionData.id,
                            user_answer: 'This is a sample answer for testing purposes',
                            ai_feedback: 'This is sample feedback',
                            rating: 8,
                            created_at: new Date().toISOString()
                        }
                    ])
                    .select()
                    .single();

                if (answerError) {
                    console.error('❌ Error inserting interview answer:', answerError);
                } else {
                    // ✅ Interview answer inserted successfully
                }
            }
        }

        // Test 5: Record Usage
        // Test 5: Inserting into usage_tracking table
        const { data: usageData, error: usageError } = await supabase
            .from('usage_tracking')
            .insert([
                {
                    user_id: TEST_USER_ID,
                    action: 'test_database_insert',
                    cost: 1,
                    free_interview_used: false,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (usageError) {
            console.error('❌ Error inserting usage record:', usageError);
        } else {
            // ✅ Usage record inserted successfully
        }

        // Test 6: Query all records for the test user
        // Test 6: Querying records for test user

        // Get profile
        const { data: profile, error: profileQueryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', TEST_USER_ID)
            .single();

        if (profileQueryError) {
            console.error('❌ Error querying profile:', profileQueryError);
        } else {
            // ✅ Retrieved profile
        }

        // Get sessions
        const { data: sessions, error: sessionQueryError } = await supabase
            .from('interview_sessions')
            .select('*')
            .eq('user_id', TEST_USER_ID);

        if (sessionQueryError) {
            console.error('❌ Error querying sessions:', sessionQueryError);
        } else {
            // ✅ Retrieved sessions
        }

        // Get usage records
        const { data: usage, error: usageQueryError } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', TEST_USER_ID);

        if (usageQueryError) {
            console.error('❌ Error querying usage:', usageQueryError);
        } else {
            // ✅ Retrieved usage records
        }

        // All database tests completed

    } catch (error) {
        console.error('❌ Unexpected error during database tests:', error);
    }
}

async function testWithServiceRole(serviceRoleKey) {
    // Create client with service role key (has full access)
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    });

    // Attempting direct database access with service role

    try {
        // Test direct insert without authentication
        const { data: profileData, error: profileError } = await serviceClient
            .from('profiles')
            .insert([
                {
                    id: TEST_USER_ID,
                    email: 'test@example.com',
                    full_name: 'Test User (Service Role)',
                    bio: 'This is a test user for database testing using service role',
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (profileError) {
            console.error('❌ Error inserting profile with service role:', profileError);
        } else {
            // ✅ Profile inserted successfully with service role
        }

        // Service role access test completed
    } catch (error) {
        console.error('❌ Service role test error:', error);
    }
}

// Run the enhanced test
testDatabaseOperationsWithAuthCheck();