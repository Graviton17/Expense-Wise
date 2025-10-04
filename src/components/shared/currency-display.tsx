import { FC } from "react";

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  showSymbol?: boolean;
  precision?: number;
}

const CurrencyDisplay: FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  showSymbol = true,
  precision = 2,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(amount);
    } catch (error) {
      // Fallback for unsupported currencies
      return `${currency} ${amount.toFixed(precision)}`;
    }
  };

  const formattedAmount = showSymbol
    ? formatCurrency(amount, currency)
    : amount.toFixed(precision);

  return (
    <span className="font-medium text-gray-900">
      {formattedAmount}
      {!showSymbol && ` ${currency}`}
    </span>
  );
};

export default CurrencyDisplay;
