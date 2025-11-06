import { Dispatch, SetStateAction } from "react";
import { useToast } from "@/lib/toast";

// Define the necessary types for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
    _stopVoiceRecording: (() => void) | undefined;
  }
}

// Helper function to extract job title from job posting
export const extractJobTitle = (jobPosting: string): string => {
  // Look for common job title patterns
  const titleMatch = jobPosting.match(/^(.+?) at |^(.+?) - |^(.+?)\n/i);
  if (titleMatch) {
    // Return the first non-null captured group (1, 2, or 3)
    return (titleMatch[1] || titleMatch[2] || titleMatch[3] || "").trim();
  }
  return "Interview Practice";
};

// Helper function to extract company name from job posting
export const extractCompanyName = (jobPosting: string): string => {
  // Look for patterns like "at CompanyName" or "Company Name"
  const companyMatch = jobPosting.match(
    /at ([^,\n]+)|Company:\s*([^\n]+)|([A-Z][A-Za-z\s]+)\n/i
  );
  if (companyMatch) {
    // Return the first non-null captured group (1, 2, or 3)
    return (companyMatch[1] || companyMatch[2] || companyMatch[3] || "").trim();
  }
  return "Unknown Company";
};

// Function to stop voice recording
export const stopVoiceRecording = (
  recognition: SpeechRecognition,
  stream: MediaStream,
  timer: NodeJS.Timeout,
  setIsRecording: Dispatch<SetStateAction<boolean>>,
  setRecordingTime: Dispatch<SetStateAction<number>>,
  setRecordingTimer: Dispatch<SetStateAction<NodeJS.Timeout | null>>
) => {
  recognition.stop();
  setIsRecording(false);
  setRecordingTime(0);
  if (timer) {
    clearInterval(timer);
    setRecordingTimer(null);
  }
  stream.getTracks().forEach((track) => track.stop()); // Stop microphone
};

// Function to start voice recording and transcription using Web Speech API
export const startVoiceRecording = async (
  setAnswer: Dispatch<SetStateAction<string>>,
  setIsRecording: Dispatch<SetStateAction<boolean>>,
  setRecordingTime: Dispatch<SetStateAction<number>>,
  setRecordingTimer: Dispatch<SetStateAction<NodeJS.Timeout | null>>,
  error: (message: string) => void
) => {
  try {
    // Check for browser support
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      error(
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Opera for best experience."
      );
      return;
    }

    // Check for online status before attempting to connect to speech recognition service
    if (!navigator.onLine) {
      error(
        "You appear to be offline. Speech recognition requires an internet connection. Please type your answer instead."
      );
      return;
    }

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Set up speech recognition
    const SpeechRecognition: SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      // Update the answer field with both final and interim results
      setAnswer(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setRecordingTime(0);
      setRecordingTimer((timer) => {
        if (timer) {
          clearInterval(timer);
        }
        return null;
      });
      if (stream) {
        stream.getTracks().forEach((track) => track.stop()); // Stop microphone
      }

      // Handle specific error types with more helpful guidance
      if (event.error === "network") {
        error(
          "Speech recognition requires an internet connection to Google's servers. This feature may not work behind certain firewalls or corporate networks. Please try typing your answer instead."
        );
      } else if (event.error === "no-speech") {
        error(
          "No speech detected. Please speak louder, ensure your microphone is working, and try again. If problems persist, type your answer instead."
        );
      } else if (event.error === "audio-capture") {
        error(
          "Could not access microphone. Please check microphone permissions in your browser settings, ensure no other applications are using the microphone, and try again. If issues continue, type your answer instead."
        );
      } else if (event.error === "not-allowed") {
        error(
          "Microphone access denied. Please go to your browser settings, allow microphone access for this site, and try again. As an alternative, you can type your answer."
        );
      } else if (event.error === "service-not-allowed") {
        error(
          "Speech recognition service not allowed. Your browser or network may restrict access to speech services. Please type your answer instead."
        );
      } else if (event.error === "bad-grammar") {
        error(
          "Speech recognition grammar error occurred. This is typically a system error. Please type your answer instead."
        );
      } else {
        error(
          `Recording error (${event.error}). Web Speech API requires internet connectivity. You can type your answer instead, which is just as effective for our AI analysis.`
        );
      }
    };

    recognition.onend = () => {
      // When recognition stops, update UI
      setIsRecording(false);
      setRecordingTime(0);
      setRecordingTimer((timer) => {
        if (timer) {
          clearInterval(timer);
        }
        return null;
      });
      stream.getTracks().forEach((track) => track.stop()); // Stop microphone
    };

    // Start recognition
    recognition.start();
    setIsRecording(true);

    // Start recording timer
    const timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setRecordingTimer(timer);

    // Stop recording after 30 seconds max to prevent excessive recording
    const autoStopTimer = setTimeout(() => {
      // Use a local variable for recognition and stream to pass to stopVoiceRecording
      const currentRecognition = recognition;
      const currentStream = stream;
      const currentTimer = timer;

      setIsRecording((prev) => {
        if (prev) {
          stopVoiceRecording(
            currentRecognition,
            currentStream,
            currentTimer,
            setIsRecording,
            setRecordingTime,
            setRecordingTimer
          );
        }
        return false;
      });
    }, 30000); // 30 seconds max

    // Store reference to stop function
    window._stopVoiceRecording = () => {
      stopVoiceRecording(
        recognition,
        stream,
        timer,
        setIsRecording,
        setRecordingTime,
        setRecordingTimer
      );
      clearTimeout(autoStopTimer);
    };
  } catch (err) {
    console.error("Error accessing microphone:", err);
    error(
      "Could not access microphone. Please check permissions and try again."
    );
  }
};

// Function to handle the speak answer button click
export const handleSpeakAnswerClick = (
  isRecording: boolean,
  recordingTimer: NodeJS.Timeout | null,
  setIsRecording: Dispatch<SetStateAction<boolean>>,
  setRecordingTime: Dispatch<SetStateAction<number>>,
  setRecordingTimer: Dispatch<SetStateAction<NodeJS.Timeout | null>>,
  startVoiceRecording: () => Promise<void>
) => {
  if (isRecording) {
    // If already recording, stop it
    if (window._stopVoiceRecording) {
      window._stopVoiceRecording();
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  } else {
    // Start recording
    startVoiceRecording();
  }
};
