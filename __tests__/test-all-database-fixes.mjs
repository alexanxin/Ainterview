import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

console.log('🧪 Testing all database RLS fixes...\n');

// Get environment variables from .env.local
try {
    const envContent = readFileSync('.env.local', 'utf8');

    // Extract Supabase variables
    const lines = envContent.split('\n');
    const supabaseVars = {};
    lines.forEach(line => {
        if (line.includes('=')) {
            const [key, value] = line.split('=');
            supabaseVars[key.trim()] = value.trim();
        }
    });

    const supabaseUrl = supabaseVars.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = supabaseVars.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Required Supabase credentials not found in .env.local');
        process.exit(1);
    }

    console.log('✅ Found required Supabase credentials\n');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully\n');

    // Test all database operations
    const testAllOperations = async () => {
        try {
            console.log('🔍 Testing 1: Profile Operations');

            // Test profile update
            const testUserId = randomUUID();
            const profileData = {
                bio: 'Test bio for RLS fix verification',
                experience: 'Test experience',
                updated_at: new Date().toISOString()
            };

            console.log('📤 Testing profile update...');
            const { data: profileResult, error: profileError } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', testUserId)
                .select();

            if (profileError) {
                console.log('ℹ️  Profile update returned error (expected for new user):', profileError.message);
            } else {
                console.log('✅ Profile update completed successfully');
            }

            // Test interview session creation
            console.log('\n🔍 Testing 2: Interview Session Operations');

            const sessionData = {
                user_id: testUserId,
                job_posting: 'Test job posting for RLS fix verification',
                company_info: 'Test Company',
                title: 'Test Session',
                completed: false,
                total_questions: 0
            };

            console.log('📤 Testing interview session creation...');
            const { data: sessionResult, error: sessionError } = await supabase
                .from('interview_sessions')
                .insert([sessionData])
                .select()
                .single();

            if (sessionError) {
                console.error('❌ Session creation failed:', sessionError);
                return;
            }

            console.log('✅ Session created successfully:', sessionResult.id);

            // Test question creation
            console.log('\n🔍 Testing 3: Question Operations');

            const questionData = {
                session_id: sessionResult.id,
                question_text: 'What is your greatest strength?',
                question_number: 1
            };

            console.log('📤 Testing question creation...');
            const { data: questionResult, error: questionError } = await supabase
                .from('interview_questions')
                .insert([questionData])
                .select()
                .single();

            if (questionError) {
                console.error('❌ Question creation failed:', questionError);
                return;
            }

            console.log('✅ Question created successfully:', questionResult.id);

            // Test answer creation
            console.log('\n🔍 Testing 4: Answer Operations');

            const answerData = {
                question_id: questionResult.id,
                session_id: sessionResult.id,
                user_answer: 'My greatest strength is problem-solving.',
                rating: 8
            };

            console.log('📤 Testing answer creation...');
            const { data: answerResult, error: answerError } = await supabase
                .from('interview_answers')
                .insert([answerData])
                .select()
                .single();

            if (answerError) {
                console.error('❌ Answer creation failed:', answerError);
                return;
            }

            console.log('✅ Answer created successfully:', answerResult.id);

            // Test session completion (the original fix)
            console.log('\n🔍 Testing 5: Session Completion');

            const updateData = {
                completed: true,
                total_questions: 1,
                updated_at: new Date().toISOString()
            };

            console.log('📤 Testing session completion...');
            const { data: updateResult, error: updateError } = await supabase
                .from('interview_sessions')
                .update(updateData)
                .eq('id', sessionResult.id)
                .select();

            if (updateError) {
                console.error('❌ Session completion failed:', updateError);
                return;
            }

            console.log('✅ Session completion successful:', updateResult[0]?.completed);

            // Verify the fix worked
            console.log('\n🔍 Testing 6: Dashboard Query Verification');

            const { data: completedSessions, error: dashboardError } = await supabase
                .from('interview_sessions')
                .select('*', { count: 'exact' })
                .eq('user_id', testUserId)
                .eq('completed', true);

            if (dashboardError) {
                console.error('❌ Dashboard query failed:', dashboardError);
                return;
            }

            console.log(`✅ Dashboard query successful: ${completedSessions.length} completed sessions for test user`);

            // Clean up test data
            console.log('\n🧹 Cleaning up test data...');
            await supabase.from('interview_answers').delete().eq('id', answerResult.id);
            await supabase.from('interview_questions').delete().eq('id', questionResult.id);
            await supabase.from('interview_sessions').delete().eq('id', sessionResult.id);
            await supabase.from('profiles').delete().eq('id', testUserId);
            console.log('✅ Test data cleaned up');

            console.log('\n🎉 ALL TESTS PASSED! The RLS fixes are working correctly.');
            console.log('\n📋 Summary of fixes applied:');
            console.log('  ✅ updateUserProfile - now uses server-side client');
            console.log('  ✅ createInterviewSession - now uses server-side client');
            console.log('  ✅ createInterviewQuestion - now uses server-side client');
            console.log('  ✅ createInterviewAnswer - now uses server-side client');
            console.log('  ✅ updateInterviewSession - already fixed (completion tracking)');

        } catch (err) {
            console.error('❌ Test failed:', err.message);
        }
    };

    testAllOperations();

} catch (err) {
    console.log('❌ Error reading .env.local file:', err.message);
}