import { z } from 'zod';

export const AccountTypeSchema = z.enum(['SAVINGS', 'CHECKING', 'INVESTMENT']);
export type AccountType = z.infer<typeof AccountTypeSchema>;

export const CurrencySchema = z.enum(['IRR', 'USD', 'EUR']);
export type Currency = z.infer<typeof CurrencySchema>;

export const BankAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string().min(10).max(26),
  ownerName: z.string().min(2),
  type: AccountTypeSchema,
  balance: z.number(),
  currency: CurrencySchema,
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type BankAccount = z.infer<typeof BankAccountSchema>;

export const CreateAccountSchema = z.object({
  ownerName: z.string().min(2, 'نام صاحب حساب باید حداقل ۲ حرف باشد'),
  type: AccountTypeSchema,
  currency: CurrencySchema.default('IRR'),
  initialDeposit: z.number().nonnegative('مبلغ افتتاح حساب نمیتواند منفی باشد').default(0),
});
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;

export const TransferMoneySchema = z.object({
  fromAccountId: z.string().uuid('شناسه حساب مبدا نامعتبر است'),
  toAccountId: z.string().uuid('شناسه حساب مقصد نامعتبر است'),
  amount: z.number().positive('مبلغ انتقال باید بیشتر از صفر باشد'),
  description: z.string().max(255).optional(),
});
export type TransferMoneyDto = z.infer<typeof TransferMoneySchema>;

export const TransactionTypeSchema = z.enum([
  'DEPOSIT',
  'WITHDRAWAL',
  'TRANSFER_IN',
  'TRANSFER_OUT',
]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionStatusSchema = z.enum(['PENDING', 'COMPLETED', 'FAILED']);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  type: TransactionTypeSchema,
  amount: z.number().positive(),
  status: TransactionStatusSchema,
  description: z.string().optional(),
  timestamp: z.string(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const ErrorCodes = {
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  INVALID_TRANSFER_AMOUNT: 'INVALID_TRANSFER_AMOUNT',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
