import { FC } from "react";

interface ExpenseSubmissionFormProps {
  onSubmit?: (data: ExpenseFormData) => void;
  isLoading?: boolean;
}

interface ExpenseFormData {
  amount: number;
  category: string;
  description: string;
  date: Date;
  receipts: File[];
}

const ExpenseSubmissionForm: FC<ExpenseSubmissionFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  return (
    <form className="space-y-6">
      {/* Expense Details Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Expense Details
        </h3>
        {/* Amount, Category, Description, Date fields */}
      </div>

      {/* Receipt Upload Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Receipt Upload
        </h3>
        {/* File upload component with OCR processing */}
      </div>

      {/* Submit Button */}
      <div>{/* Submit button with loading state */}</div>
    </form>
  );
};

export default ExpenseSubmissionForm;
export type { ExpenseFormData };
