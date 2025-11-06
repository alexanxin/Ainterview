import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
} from "@/lib/database";

// API functions using the server-side endpoint to ensure proper permissions
export const createInterviewSession = async (
  sessionData: Omit<InterviewSession, "id" | "created_at" | "updated_at">
) => {
  try {
    const response = await fetch("/api/interview/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "createSession",
        ...sessionData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create interview session");
    }

    const result = await response.json();
    return result.session;
  } catch (error) {
    return null;
  }
};

export const createInterviewQuestion = async (
  questionData: Omit<InterviewQuestion, "id" | "created_at">
) => {
  try {
    const response = await fetch("/api/interview/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "createQuestion",
        ...questionData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create interview question");
    }

    const result = await response.json();
    return result.question;
  } catch (error) {
    return null;
  }
};

export const createInterviewAnswer = async (
  answerData: Omit<InterviewAnswer, "id" | "created_at">
) => {
  try {
    const response = await fetch("/api/interview/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "createAnswer",
        ...answerData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create interview answer");
    }

    const result = await response.json();
    return result.answer;
  } catch (error) {
    return null;
  }
};

export const updateInterviewSession = async (
  sessionId: string,
  sessionData: Partial<InterviewSession>
) => {
  try {
    const response = await fetch("/api/interview/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "updateSession",
        session_id: sessionId,
        ...sessionData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update interview session");
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    return false;
  }
};

// Function to get questions using the server-side API endpoint
export const getQuestionBySessionAndNumber = async (
  sessionId: string,
  questionNumber: number
): Promise<InterviewQuestion | null> => {
  try {
    const response = await fetch(
      `/api/interview/session?action=getQuestionBySessionAndNumber&sessionId=${sessionId}&questionNumber=${questionNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get interview question");
    }

    const result = await response.json();
    return result.question as InterviewQuestion | null;
  } catch (error) {
    return null;
  }
};

export const getInterviewSessionsByUser = async (
  userId: string
): Promise<InterviewSession[]> => {
  try {
    const response = await fetch(
      `/api/interview/session?action=getUserSessions&user_id=${userId}`,
      {
        method: "POST", // The API route uses POST for getUserSessions in the POST handler
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getUserSessions",
          user_id: userId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch user sessions");
    }

    const result = await response.json();
    return result.sessions as InterviewSession[];
  } catch (error) {
    return [];
  }
};

export const getQuestionsBySession = async (
  sessionId: string
): Promise<InterviewQuestion[]> => {
  try {
    const response = await fetch(
      `/api/interview/session?action=getQuestionsBySession&sessionId=${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch questions");
    }

    const result = await response.json();
    return result.questions as InterviewQuestion[];
  } catch (error) {
    return [];
  }
};

export const getAnswersBySession = async (
  sessionId: string
): Promise<InterviewAnswer[]> => {
  try {
    const response = await fetch(
      `/api/interview/session?action=getAnswersBySession&sessionId=${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch answers");
    }

    const result = await response.json();
    return result.answers as InterviewAnswer[];
  } catch (error) {
    return [];
  }
};
