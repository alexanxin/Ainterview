import { NextRequest, NextResponse } from "next/server";
import {
  createInterviewSession as dbCreateInterviewSession,
  getInterviewSessionsByUser,
  updateInterviewSession as dbUpdateInterviewSession,
  createInterviewQuestion as dbCreateInterviewQuestion,
  createInterviewAnswer as dbCreateInterviewAnswer,
  recordUsage,
  getUserInterviewsCompleted,
  getQuestionBySessionAndNumber as dbGetQuestionBySessionAndNumber,
  getQuestionsBySession as dbGetQuestionsBySession,
  getAnswersBySession as dbGetAnswersBySession,
} from "@/lib/database";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "createSession": {
        const {
          user_id,
          job_posting,
          company_info,
          user_cv,
          title,
          total_questions,
        } = data;

        if (!user_id || !job_posting) {
          return NextResponse.json(
            {
              error:
                "user_id and job_posting are required for creating a session",
            },
            { status: 400 }
          );
        }

        // Use server-side client for direct database operations
        if (!("from" in supabaseServer)) {
          console.warn(
            "Supabase server client not initialized - missing environment variables"
          );
          return NextResponse.json(
            { error: "Database connection not available" },
            { status: 500 }
          );
        }

        const { data: session, error } = await supabaseServer
          .from("interview_sessions")
          .insert([
            {
              user_id,
              job_posting,
              company_info,
              user_cv,
              title,
              total_questions,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Error creating interview session:", error);
          console.error("Error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
          });
          return NextResponse.json(
            { error: "Failed to create interview session" },
            { status: 500 }
          );
        }

        return NextResponse.json({ session }, { status: 200 });
      }

      case "createQuestion": {
        const { session_id, question_text, question_number } = data;

        if (!session_id || !question_text || question_number === undefined) {
          return NextResponse.json(
            {
              error:
                "session_id, question_text, and question_number are required for creating a question",
            },
            { status: 400 }
          );
        }

        // Use server-side client for direct database operations
        if (!("from" in supabaseServer)) {
          console.warn(
            "Supabase server client not initialized - missing environment variables"
          );
          return NextResponse.json(
            { error: "Database connection not available" },
            { status: 500 }
          );
        }

        const { data: question, error } = await supabaseServer
          .from("interview_questions")
          .insert([
            {
              session_id,
              question_text,
              question_number,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Error creating interview question:", error);
          return NextResponse.json(
            { error: "Failed to create interview question" },
            { status: 500 }
          );
        }

        return NextResponse.json({ question }, { status: 200 });
      }

      case "createAnswer": {
        const {
          question_id,
          session_id,
          user_answer,
          ai_feedback,
          improvement_suggestions,
          rating,
        } = data;

        if (!question_id || !session_id || !user_answer) {
          return NextResponse.json(
            {
              error:
                "question_id, session_id, and user_answer are required for creating an answer",
            },
            { status: 400 }
          );
        }

        // Use server-side client for direct database operations
        if (!("from" in supabaseServer)) {
          console.warn(
            "Supabase server client not initialized - missing environment variables"
          );
          return NextResponse.json(
            { error: "Database connection not available" },
            { status: 500 }
          );
        }

        const { data: answer, error } = await supabaseServer
          .from("interview_answers")
          .insert([
            {
              question_id,
              session_id,
              user_answer,
              ai_feedback,
              improvement_suggestions,
              rating,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Error creating interview answer:", error);
          return NextResponse.json(
            { error: "Failed to create interview answer" },
            { status: 500 }
          );
        }

        return NextResponse.json({ answer }, { status: 200 });
      }

      case "updateSession": {
        const { session_id, ...updateData } = data;

        if (!session_id) {
          return NextResponse.json(
            { error: "session_id is required for updating a session" },
            { status: 400 }
          );
        }

        // Use server-side client for direct database operations
        if (!("from" in supabaseServer)) {
          console.warn(
            "Supabase server client not initialized - missing environment variables"
          );
          return NextResponse.json(
            { error: "Database connection not available" },
            { status: 500 }
          );
        }

        const result = await supabaseServer
          .from("interview_sessions")
          .update(updateData)
          .eq("id", session_id);

        // Check if result has error property (normal Supabase response) or is a mock response
        if ("error" in result && result.error) {
          console.error("Error updating interview session:", result.error);
          return NextResponse.json(
            { error: "Failed to update interview session" },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true }, { status: 200 });
      }

      case "getUserSessions": {
        const { user_id } = data;

        if (!user_id) {
          return NextResponse.json(
            { error: "user_id is required for fetching user sessions" },
            { status: 400 }
          );
        }

        // Use server-side client for direct database operations
        if (!("from" in supabaseServer)) {
          console.warn(
            "Supabase server client not initialized - missing environment variables"
          );
          return NextResponse.json(
            { error: "Database connection not available" },
            { status: 500 }
          );
        }

        const { data: sessions, error } = await supabaseServer
          .from("interview_sessions")
          .select("*")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching interview sessions:", error);
          return NextResponse.json(
            { error: "Failed to fetch interview sessions" },
            { status: 500 }
          );
        }

        return NextResponse.json({ sessions }, { status: 200 });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in interview session API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const sessionId = searchParams.get("sessionId");
    const questionNumber = searchParams.get("questionNumber");

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "getQuestionBySessionAndNumber": {
        if (!sessionId || questionNumber === null) {
          return NextResponse.json(
            {
              error:
                "sessionId and questionNumber are required for fetching a question",
            },
            { status: 400 }
          );
        }

        // Use server-side client for direct database operations
        if (!("from" in supabaseServer)) {
          console.warn(
            "Supabase server client not initialized - missing environment variables"
          );
          return NextResponse.json(
            { error: "Database connection not available" },
            { status: 500 }
          );
        }

        // Check if it's the real Supabase client vs mock client
        if (typeof supabaseServer.from === "function") {
          // It's the real client
          const result = await supabaseServer
            .from("interview_questions")
            .select("*")
            .eq("session_id", sessionId)
            .eq("question_number", parseInt(questionNumber))
            .single();

          // Check if result has error property (normal Supabase response)
          if ("error" in result && result.error) {
            if (result.error.code === "PGRST116") {
              // Row not found
              return NextResponse.json({ question: null }, { status: 200 });
            }
            console.error(
              "Error fetching question by session and number:",
              result.error
            );
            return NextResponse.json(
              { error: "Failed to fetch question" },
              { status: 500 }
            );
          }

          return NextResponse.json({ question: result.data }, { status: 200 });
        } else {
          // It's the mock client, use the original database function
          const question = await dbGetQuestionBySessionAndNumber(
            sessionId,
            parseInt(questionNumber)
          );
          return NextResponse.json({ question }, { status: 200 });
        }
      }

      case "getQuestionsBySession": {
        if (!sessionId) {
          return NextResponse.json(
            { error: "sessionId is required for fetching questions" },
            { status: 400 }
          );
        }

        // Use server-side client for direct database operations
        if (!("from" in supabaseServer)) {
          console.warn(
            "Supabase server client not initialized - missing environment variables"
          );
          return NextResponse.json(
            { error: "Database connection not available" },
            { status: 500 }
          );
        }

        // Check if it's the real Supabase client vs mock client
        if (typeof supabaseServer.from === "function") {
          // It's the real client
          const result = await supabaseServer
            .from("interview_questions")
            .select("*")
            .eq("session_id", sessionId)
            .order("question_number", { ascending: true });

          // Check if result has error property (normal Supabase response)
          if ("error" in result && result.error) {
            console.error("Error fetching questions by session:", result.error);
            return NextResponse.json(
              { error: "Failed to fetch questions" },
              { status: 500 }
            );
          }

          return NextResponse.json({ questions: result.data }, { status: 200 });
        } else {
          // It's the mock client, use the original database function
          const questions = await dbGetQuestionsBySession(sessionId);
          return NextResponse.json({ questions }, { status: 200 });
        }
      }

      case "getAnswersBySession": {
        if (!sessionId) {
          return NextResponse.json(
            { error: "sessionId is required for fetching answers" },
            { status: 400 }
          );
        }

        // Use server-side client for direct database operations
        if (!("from" in supabaseServer)) {
          console.warn(
            "Supabase server client not initialized - missing environment variables"
          );
          return NextResponse.json(
            { error: "Database connection not available" },
            { status: 500 }
          );
        }

        // Check if it's the real Supabase client vs mock client
        if (typeof supabaseServer.from === "function") {
          // It's the real client
          const result = await supabaseServer
            .from("interview_answers")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true });

          // Check if result has error property (normal Supabase response)
          if ("error" in result && result.error) {
            console.error("Error fetching answers by session:", result.error);
            return NextResponse.json(
              { error: "Failed to fetch answers" },
              { status: 500 }
            );
          }

          return NextResponse.json({ answers: result.data }, { status: 200 });
        } else {
          // It's the mock client, use the original database function
          const answers = await dbGetAnswersBySession(sessionId);
          return NextResponse.json({ answers }, { status: 200 });
        }
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in interview session GET API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
