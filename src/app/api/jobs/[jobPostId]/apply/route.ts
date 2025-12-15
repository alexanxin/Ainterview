// /src/app/api/jobs/[jobPostId]/apply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { Logger } from "@/lib/logger";
import {
  createApplicantResponse,
  getUserCredits,
  deductUserCredits,
} from "@/lib/database";

// Define the route handler for job applications
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobPostId: string }> }
) {
  console.log("🔄 API STEP 1: Application submission API called");

  try {
    const { jobPostId } = await params;
    console.log("📊 API STEP 1.1: Parsed jobPostId:", jobPostId);

    if (!jobPostId) {
      console.log("❌ API STEP 1.2: Missing jobPostId");
      return NextResponse.json(
        { error: "Job post ID is required" },
        { status: 400 }
      );
    }

    console.log("🔄 API STEP 2: Parsing request body");
    const {
      applicant_email,
      applicant_name,
      applicant_cv,
      answers,
      status = "pending",
    } = await req.json();

    console.log("📋 API STEP 2.1: Request body parsed:", {
      applicant_email: applicant_email ? "present" : "missing",
      applicant_name: applicant_name ? "present" : "missing",
      answersCount: Array.isArray(answers) ? answers.length : "not array",
      status,
      hasCV: !!applicant_cv,
    });

    console.log("🔄 API STEP 3: Validating required fields");
    // Validate required fields
    if (!applicant_email || !applicant_name || !answers) {
      console.log(
        "❌ API STEP 3.1: Validation failed - missing required fields"
      );
      return NextResponse.json(
        {
          error:
            "Missing required fields: applicant_email, applicant_name, or answers",
        },
        { status: 400 }
      );
    }

    console.log("✅ API STEP 3.2: All validations passed");

    Logger.info("💼 JOB APPLICATION: Processing job application", {
      jobPostId,
      applicantEmail: applicant_email,
      applicantName: applicant_name,
      answersCount: Array.isArray(answers) ? answers.length : 0,
      timestamp: new Date().toISOString(),
    });

    console.log("🔄 API STEP 4: Fetching job post details");
    // Get the job post to verify it exists and get credit cost
    const { data: jobPost, error: jobPostError } = await supabaseServer
      .from("job_posts")
      .select("id, title, company_id, status, credit_cost_per_applicant")
      .eq("id", jobPostId)
      .single();

    if (jobPostError || !jobPost) {
      console.log("❌ API STEP 4.1: Job post not found", {
        jobPostId,
        jobPostError,
      });
      Logger.error("❌ JOB APPLICATION: Job post not found", {
        jobPostId,
        jobPostError,
      });
      return NextResponse.json(
        { error: "Job post not found" },
        { status: 404 }
      );
    }

    console.log("✅ API STEP 4.2: Job post found", {
      title: jobPost.title,
      status: jobPost.status,
      creditCost: jobPost.credit_cost_per_applicant,
    });

    console.log("🔄 API STEP 5: Checking job post status");
    // Check if job post is active
    if (jobPost.status !== "active") {
      console.log("❌ API STEP 5.1: Job post is not active", {
        status: jobPost.status,
      });
      Logger.error("❌ JOB APPLICATION: Job post is not active", {
        jobPostId,
        jobPostStatus: jobPost.status,
      });
      return NextResponse.json(
        { error: "This job post is not accepting applications" },
        { status: 400 }
      );
    }

    console.log("✅ API STEP 5.2: Job post is active");

    console.log("🔄 API STEP 6: Fetching company details");
    // Get the company to find the owner (user_id)
    const { data: company, error: companyError } = await supabaseServer
      .from("companies")
      .select("user_id")
      .eq("id", jobPost.company_id)
      .single();

    if (companyError || !company) {
      console.log("❌ API STEP 6.1: Company not found", {
        companyId: jobPost.company_id,
        companyError,
      });
      Logger.error("❌ JOB APPLICATION: Company not found for job post", {
        jobPostId,
        companyId: jobPost.company_id,
        companyError,
      });
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    console.log("✅ API STEP 6.2: Company found", {
      companyUserId: company.user_id,
    });

    console.log("🔄 API STEP 7: Checking company credits");
    // Check if the company owner has sufficient credits
    const companyOwnerCredits = await getUserCredits(company.user_id);
    const creditCost = jobPost.credit_cost_per_applicant || 1; // Default to 1 credit if not set

    console.log("📊 API STEP 7.1: Credit check results", {
      companyOwnerCredits,
      creditCost,
      sufficient: companyOwnerCredits >= creditCost,
    });

    if (companyOwnerCredits < creditCost) {
      console.log("❌ API STEP 7.2: Insufficient credits");
      Logger.error("❌ JOB APPLICATION: Insufficient credits", {
        jobPostId,
        companyOwnerId: company.user_id,
        requiredCredits: creditCost,
        availableCredits: companyOwnerCredits,
      });
      return NextResponse.json(
        {
          error: `Insufficient credits. This application costs ${creditCost} credits, but you only have ${companyOwnerCredits} credits.`,
        },
        { status: 402 } // Payment required
      );
    }

    console.log("✅ API STEP 7.3: Sufficient credits available");

    console.log("🔄 API STEP 8: Preparing applicant response data");
    // Get the user ID from the auth token if provided (for logged-in users)
    // For simplicity in the current implementation, we'll just pass it as part of the request
    // In a production implementation, you would verify the auth token here
    const user_id = req.headers.get("x-user-id") || undefined;

    console.log("📊 API STEP 8.1: User authentication check", {
      hasUserId: !!user_id,
      userId: user_id,
    });

    // Prepare applicant response data
    const applicantResponseData = {
      job_post_id: jobPostId,
      applicant_user_id: user_id || undefined, // Only if user is logged in
      applicant_email: applicant_email.trim(),
      applicant_name: applicant_name.trim(),
      applicant_cv: applicant_cv?.trim() || null,
      answers: answers, // This should be the structured answers
      status: status,
      completed_at: new Date().toISOString(),
    };

    console.log("📋 API STEP 8.2: Prepared response data", {
      jobPostId: applicantResponseData.job_post_id,
      applicantEmail: applicantResponseData.applicant_email,
      applicantName: applicantResponseData.applicant_name,
      answersCount: Array.isArray(applicantResponseData.answers)
        ? applicantResponseData.answers.length
        : 0,
      hasCV: !!applicantResponseData.applicant_cv,
    });

    console.log("🔄 API STEP 9: Creating applicant response in database");
    // Create the applicant response in the database
    const response = await createApplicantResponse(applicantResponseData);

    if (!response) {
      console.log("❌ API STEP 9.1: Failed to create applicant response");
      Logger.error("❌ JOB APPLICATION: Failed to create applicant response", {
        jobPostId,
        applicantEmail: applicant_email,
      });
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }

    console.log("✅ API STEP 9.2: Applicant response created successfully", {
      responseId: response.id,
      jobPostId,
      applicantEmail: applicant_email,
    });

    console.log("🔄 API STEP 10: Processing credit deduction");
    // Deduct credits from the company owner
    const creditDeducted = await deductUserCredits(company.user_id, creditCost);
    if (!creditDeducted) {
      console.log("❌ API STEP 10.1: Failed to deduct credits");
      Logger.error("❌ JOB APPLICATION: Failed to deduct credits", {
        jobPostId,
        companyOwnerId: company.user_id,
        creditCost,
      });
      // Note: Application is already created, but we should notify the company about the credit deduction failure
      // For now, we'll still return success but log the error
    } else {
      console.log("✅ API STEP 10.2: Credits deducted successfully", {
        companyOwnerId: company.user_id,
        creditCost,
        previousCredits: companyOwnerCredits,
        remainingCredits: companyOwnerCredits - creditCost,
      });
      Logger.info("💰 JOB APPLICATION: Credits deducted successfully", {
        jobPostId,
        companyOwnerId: company.user_id,
        creditCost,
        remainingCredits: companyOwnerCredits - creditCost,
      });
    }

    console.log("🔄 API STEP 11: Setting up AI evaluation trigger");
    // Trigger AI evaluation of the applicant in the background
    // This is done asynchronously to not block the application submission
    try {
      console.log("🤖 API STEP 11.1: Preparing AI evaluation", {
        responseId: response.id,
        jobPostId,
        applicantEmail: applicant_email,
      });

      Logger.info("🤖 JOB APPLICATION: Triggering AI evaluation", {
        responseId: response.id,
        jobPostId,
        applicantEmail: applicant_email,
      });

      console.log("🔄 API STEP 11.2: Importing evaluation function");
      // Import the evaluation function dynamically to avoid circular dependencies
      const { evaluateApplicantWithAI } = await import("@/lib/database");

      console.log(
        "✅ API STEP 11.3: Evaluation function imported successfully"
      );

      // Run evaluation asynchronously
      setImmediate(async () => {
        console.log("🚀 API STEP 11.4: Starting asynchronous AI evaluation", {
          responseId: response.id,
          timestamp: new Date().toISOString(),
        });

        try {
          console.log(
            "🔄 API STEP 11.5: Calling evaluateApplicantWithAI function"
          );
          const evaluation = await evaluateApplicantWithAI(response.id);
          console.log(
            "📊 API STEP 11.6: AI evaluation raw response:",
            evaluation
          );

          if (evaluation.success) {
            console.log(
              "✅ API STEP 11.7: AI evaluation completed successfully"
            );
            console.log("📋 API STEP 11.8: AI evaluation details:", {
              overallScore: evaluation.evaluation?.overall_score,
              recommendedRole: evaluation.evaluation?.recommended_role,
              grade: evaluation.evaluation?.grade,
              feedback: evaluation.evaluation?.feedback,
              strengthsCount: evaluation.evaluation?.strengths?.length,
              weaknessesCount: evaluation.evaluation?.weaknesses?.length,
            });

            Logger.info("✅ JOB APPLICATION: AI evaluation completed", {
              responseId: response.id,
              overallScore: evaluation.evaluation?.overall_score,
              recommendedRole: evaluation.evaluation?.recommended_role,
              grade: evaluation.evaluation?.grade,
            });
          } else {
            console.log("❌ API STEP 11.9: AI evaluation failed", {
              error: evaluation.error,
            });
            Logger.error("❌ JOB APPLICATION: AI evaluation failed", {
              responseId: response.id,
              error: evaluation.error,
            });
          }
        } catch (evalError) {
          console.log("❌ API STEP 11.10: Exception during AI evaluation", {
            error:
              evalError instanceof Error
                ? evalError.message
                : String(evalError),
            stack: evalError instanceof Error ? evalError.stack : undefined,
          });
          Logger.error("❌ JOB APPLICATION: Exception during AI evaluation", {
            responseId: response.id,
            error:
              evalError instanceof Error
                ? evalError.message
                : String(evalError),
          });
        }
      });

      console.log(
        "✅ API STEP 11.11: AI evaluation trigger set up successfully"
      );
    } catch (importError) {
      console.log("❌ API STEP 11.12: Failed to set up AI evaluation", {
        error:
          importError instanceof Error
            ? importError.message
            : String(importError),
      });
      Logger.error("❌ JOB APPLICATION: Failed to import evaluation function", {
        responseId: response.id,
        error:
          importError instanceof Error
            ? importError.message
            : String(importError),
      });
    }

    console.log("🔄 API STEP 12: Preparing final response");

    Logger.info("✅ JOB APPLICATION: Application completed successfully", {
      responseId: response.id,
      jobPostId,
      applicantEmail: applicant_email,
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: response.id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(
      "❌ JOB APPLICATION: Unexpected error in application submission",
      {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      }
    );

    return NextResponse.json(
      { error: "Internal server error during application submission" },
      { status: 500 }
    );
  }
}
