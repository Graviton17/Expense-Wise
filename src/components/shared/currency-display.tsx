"use client";

import { cn, formatCurrency } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  baseCurrency?: string;
  convertedAmount?: number;
  exchangeRate?: number;
  variant?: "default" | "large" | "compact";
  showConversion?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  currency,
  baseCurrency,
  convertedAmount,
  exchangeRate,
  variant = "default",
  showConversion = true,
  className,
}: CurrencyDisplayProps) {
  const baseClasses = "font-family-numeric font-semibold tabular-nums";
  
  const variantClasses = {
    default: "text-base",
    large: "text-xl",
    compact: "text-sm",
  };

  const shouldShowConversion = 
    showConversion && 
    baseCurrency && 
    currency !== baseCurrency && 
    convertedAmount !== undefined;

  return (
    <div className={cn("space-y-1", className)}>
      {/* Primary Amount */}
      <div className={cn(baseClasses, variantClasses[variant], "text-gray-900")}>
        {formatCurrency(amount, currency)}
      </div>

      {/* Converted Amount */}
      {shouldShowConversion && (
        <div className="space-y-0.5">
          <div className={cn(
            baseClasses,
            variant === "large" ? "text-sm" : "text-xs",
            "text-blue-600 font-medium"
          )}>
            ≈ {formatCurrency(convertedAmount, baseCurrency)}
          </div>
          
          {/* Exchange Rate */}
          {exchangeRate && (
            <div className={cn(
              "text-xs text-gray-500",
              variant === "compact" && "text-[10px]"
            )}>
              @ {exchangeRate} {currency}/{baseCurrency}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized component for financial status (positive/negative amounts)
interface FinancialAmountProps {
  amount: number;
  currency: string;
  type?: "positive" | "negative" | "neutral";
  variant?: "default" | "large" | "compact";
  className?: string;
}

export function FinancialAmount({
  amount,
  currency,
  type = "neutral",
  variant = "default",
  className,
}: FinancialAmountProps) {
  const baseClasses = "font-family-numeric font-semibold tabular-nums";
  
  const variantClasses = {
    default: "text-base",
    large: "text-xl",
    compact: "text-sm",
  };

  const typeClasses = {
    positive: "text-green-700",
    negative: "text-red-700",
    neutral: "text-gray-900",
  };

  return (
    <span className={cn(
      baseClasses,
      variantClasses[variant],
      typeClasses[type],
      className
    )}>
      {type === "negative" && amount > 0 ? "-" : ""}
      {formatCurrency(Math.abs(amount), currency)}
    </span>
  );
}

// Currency selector component
interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  currencies: Array<{
    code: string;
    name: string;
    symbol: string;
  }>;
  disabled?: boolean;
  className?: string;
}

export function CurrencySelector({
  value,
  onChange,
  currencies,
  disabled = false,
  className,
}: CurrencySelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        className
      )}
    >
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.symbol} {currency.code} - {currency.name}
        </option>
      ))}
    </select>
  );
}

// Common currency list
export const COMMON_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
];

// Currency conversion utility hook (placeholder for future implementation)
export function useCurrencyConversion(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  // This would integrate with a real currency API
  // For now, return mock data
  return {
    convertedAmount: amount * 1.1, // Mock conversion rate
    exchangeRate: 1.1,
    isLoading: false,
    error: null,
  };
}