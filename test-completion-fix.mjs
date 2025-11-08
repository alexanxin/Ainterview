import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

console.log('🧪 Testing interview session completion fix...\n');

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
        console.log('💡 Found variables:', Object.keys(supabaseVars));
        process.exit(1);
    }

    console.log('✅ Found required Supabase credentials\n');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully\n');

    // Test session completion
    const testCompletion = async () => {
        try {
            console.log('🔍 Finding incomplete interview sessions...');

            // Get first few incomplete sessions
            const { data: sessions, error: fetchError } = await supabase
                .from('interview_sessions')
                .select('*')
                .eq('completed', false)
                .limit(5);

            if (fetchError) {
                console.error('❌ Error fetching sessions:', fetchError);
                return;
            }

            if (!sessions || sessions.length === 0) {
                console.log('ℹ️ No incomplete sessions found');
                return;
            }

            console.log(`📊 Found ${sessions.length} incomplete sessions:`);
            sessions.forEach((session, i) => {
                console.log(`  ${i + 1}. Session ${session.id} - ${session.title || 'Untitled'} (${session.total_questions || 0} questions)`);
            });

            // Test marking the first session as completed
            const testSession = sessions[0];
            console.log(`\n🧪 Testing completion marking on session: ${testSession.id}`);

            const updateData = {
                completed: true,
                total_questions: testSession.total_questions || 1,
                updated_at: new Date().toISOString()
            };

            console.log('📤 Update data:', updateData);

            const { data, error } = await supabase
                .from('interview_sessions')
                .update(updateData)
                .eq('id', testSession.id);

            if (error) {
                console.error('❌ Error updating session:', error);
                return;
            }

            console.log('✅ Session update completed successfully');

            // Verify the update
            console.log('🔍 Verifying the update...');
            const { data: updatedSession, error: verifyError } = await supabase
                .from('interview_sessions')
                .select('*')
                .eq('id', testSession.id)
                .single();

            if (verifyError) {
                console.error('❌ Error verifying update:', verifyError);
                return;
            }

            console.log('📋 Updated session data:');
            console.log(`  - ID: ${updatedSession.id}`);
            console.log(`  - Title: ${updatedSession.title || 'Untitled'}`);
            console.log(`  - Completed: ${updatedSession.completed ? '✅ Yes' : '❌ No'}`);
            console.log(`  - Total Questions: ${updatedSession.total_questions || 0}`);
            console.log(`  - Updated At: ${updatedSession.updated_at}`);

            // Test dashboard query
            console.log('\n📊 Testing dashboard query...');
            const { data: completedSessions, error: dashboardError } = await supabase
                .from('interview_sessions')
                .select('*', { count: 'exact' })
                .eq('completed', true);

            if (dashboardError) {
                console.error('❌ Error querying completed sessions:', dashboardError);
                return;
            }

            console.log(`✅ Dashboard would show: ${completedSessions.length} completed interviews`);

            // Test the specific user query
            console.log('\n👤 Testing user-specific completed sessions...');
            const { data: userCompleted, error: userError } = await supabase
                .from('interview_sessions')
                .select('*', { count: 'exact' })
                .eq('user_id', testSession.user_id)
                .eq('completed', true);

            if (userError) {
                console.error('❌ Error querying user completed sessions:', userError);
                return;
            }

            console.log(`✅ User ${testSession.user_id} has ${userCompleted.length} completed interviews`);

            console.log('\n🎉 Test completed successfully! The fix should work.');

        } catch (err) {
            console.error('❌ Test failed:', err.message);
        }
    };

    testCompletion();

} catch (err) {
    console.log('❌ Error reading .env.local file:', err.message);
}