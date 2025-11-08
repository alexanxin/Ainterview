import { Logger } from "./logger";

export interface PaymentRecord {
  id?: string;
  user_id: string;
  transaction_id: string;
  expected_amount: number;
  token: string;
  recipient: string;
  status: "pending" | "confirmed" | "failed";
  created_at?: string;
  updated_at?: string;
}

export class PaymentRecordsService {
  private static instance: PaymentRecordsService;

  private constructor() {}

  public static getInstance(): PaymentRecordsService {
    if (!PaymentRecordsService.instance) {
      PaymentRecordsService.instance = new PaymentRecordsService();
    }
    return PaymentRecordsService.instance;
  }

  // Insert a pending payment record
  async insertPendingRecord(
    record: Omit<PaymentRecord, "id" | "status" | "created_at" | "updated_at">
  ): Promise<PaymentRecord | null> {
    try {
      Logger.info("Creating pending payment record via API", {
        user_id: record.user_id,
        transaction_id: record.transaction_id,
        expected_amount: record.expected_amount,
        token: record.token,
      });

      const response = await fetch("/api/payment/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: record.user_id,
          transaction_id: record.transaction_id,
          expected_amount: record.expected_amount,
          token: record.token,
          recipient: record.recipient,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Logger.error("Error creating payment record via API:", errorData);
        return null;
      }

      const data = await response.json();
      Logger.info("Payment record created successfully via API", {
        id: data.id,
        transaction_id: record.transaction_id,
      });

      return data;
    } catch (error) {
      Logger.error("Error inserting pending payment record:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // Update payment record status
  async updateRecordStatus(
    transactionId: string,
    status: "confirmed" | "failed"
  ): Promise<boolean> {
    try {
      Logger.info("Updating payment record status via API", {
        transaction_id: transactionId,
        status,
      });

      const response = await fetch(
        `/api/payment/records?transaction_id=${encodeURIComponent(
          transactionId
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        Logger.error("Error updating payment record via API:", errorData);
        return false;
      }

      Logger.info("Payment record updated successfully via API", {
        transaction_id: transactionId,
        status,
      });

      return true;
    } catch (error) {
      Logger.error("Error updating payment record status:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  // Get payment record by transaction ID
  async getRecordByTransactionId(
    transactionId: string
  ): Promise<PaymentRecord | null> {
    try {
      Logger.info("Fetching payment record via API", {
        transaction_id: transactionId,
      });

      const response = await fetch(
        `/api/payment/records?transaction_id=${encodeURIComponent(
          transactionId
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          Logger.info("Payment record not found via API", {
            transaction_id: transactionId,
          });
          return null;
        }
        const errorData = await response.json();
        Logger.error("Error fetching payment record via API:", errorData);
        return null;
      }

      const data = await response.json();
      Logger.info("Payment record fetched successfully via API", {
        id: data.id,
        transaction_id: transactionId,
        status: data.status,
      });

      return data;
    } catch (error) {
      Logger.error("Error fetching payment record:", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

export const paymentRecordsService = PaymentRecordsService.getInstance();
