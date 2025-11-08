import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId parameter is required" },
        { status: 400 }
      );
    }

    // Use server-side client with service role key to bypass RLS
    const { data: session, error: sessionError } = await supabaseServer
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
    }

    // Get all questions for this session
    const { data: questions, error: questionsError } = await supabaseServer
      .from("interview_questions")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_number", { ascending: true });

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
    }

    // Get all answers for this session
    const { data: answers, error: answersError } = await supabaseServer
      .from("interview_answers")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (answersError) {
      console.error("Error fetching answers:", answersError);
    }

    return NextResponse.json({
      sessionId,
      session: session || null,
      questions: questions || [],
      questionsCount: questions?.length || 0,
      answers: answers || [],
      answersCount: answers?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
