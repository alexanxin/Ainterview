import { 
  createInterviewSession as createSession, 
  getInterviewSessionsByUser, 
  updateInterviewSession, 
  createInterviewQuestion, 
  getQuestionsBySession, 
  createInterviewAnswer, 
  getAnswersBySession,
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer
} from '@/lib/database';

// Create a new interview session
export async function createInterviewSession(
  sessionData: Omit<InterviewSession, 'id' | 'created_at' | 'updated_at' | 'completed' | 'total_questions'>
): Promise<InterviewSession | null> {
  try {
    // Set default values for new session
    const newSession = {
      ...sessionData,
      completed: false,
      total_questions: 0
    };
    
    const result = await createSession(newSession);
    return result;
  } catch (error) {
    console.error('Error creating interview session:', error);
    return null;
  }
}

// Get all interview sessions for a user
export async function getUserInterviewSessions(userId: string): Promise<InterviewSession[]> {
  try {
    const sessions = await getInterviewSessionsByUser(userId);
    return sessions;
  } catch (error) {
    console.error('Error getting user interview sessions:', error);
    return [];
  }
}

// Update an interview session
export async function updateInterviewSessionService(
  sessionId: string, 
  sessionData: Partial<InterviewSession>
): Promise<boolean> {
  try {
    const result = await updateInterviewSession(sessionId, sessionData);
    return result;
  } catch (error) {
    console.error('Error updating interview session:', error);
    return false;
  }
}

// Create a new question in an interview session
export async function createInterviewQuestionService(
  questionData: Omit<InterviewQuestion, 'id' | 'created_at'>
): Promise<InterviewQuestion | null> {
  try {
    const result = await createInterviewQuestion(questionData);
    return result;
  } catch (error) {
    console.error('Error creating interview question:', error);
    return null;
  }
}

// Get all questions for a session
export async function getInterviewQuestions(sessionId: string): Promise<InterviewQuestion[]> {
  try {
    const questions = await getQuestionsBySession(sessionId);
    return questions;
  } catch (error) {
    console.error('Error getting interview questions:', error);
    return [];
  }
}

// Create a new answer in an interview session
export async function createInterviewAnswerService(
  answerData: Omit<InterviewAnswer, 'id' | 'created_at'>
): Promise<InterviewAnswer | null> {
  try {
    const result = await createInterviewAnswer(answerData);
    return result;
  } catch (error) {
    console.error('Error creating interview answer:', error);
    return null;
  }
}

// Get all answers for a session
export async function getInterviewAnswers(sessionId: string): Promise<InterviewAnswer[]> {
  try {
    const answers = await getAnswersBySession(sessionId);
    return answers;
  } catch (error) {
    console.error('Error getting interview answers:', error);
    return [];
  }
}

// Complete an interview session
export async function completeInterviewSession(
  sessionId: string,
  totalQuestions: number
): Promise<boolean> {
  try {
    const result = await updateInterviewSession(sessionId, {
      completed: true,
      total_questions: totalQuestions
    });
    return result;
  } catch (error) {
    console.error('Error completing interview session:', error);
    return false;
  }
}