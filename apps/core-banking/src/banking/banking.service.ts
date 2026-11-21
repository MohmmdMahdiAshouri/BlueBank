import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  BankAccount,
  Transaction,
  TransferMoneyDto,
  CreateAccountDto,
  TransferMoneySchema,
  CreateAccountSchema,
  ErrorCodes,
} from '../contracts';

@Injectable()
export class BankingService {
  private accounts: BankAccount[] = [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      accountNumber: '6219861012345678',
      ownerName: 'سارا محمدی',
      type: 'SAVINGS',
      balance: 154000000,
      currency: 'IRR',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
      accountNumber: '6219861087654321',
      ownerName: 'علی رضایی',
      type: 'CHECKING',
      balance: 42000000,
      currency: 'IRR',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  private transactions: Transaction[] = [];

  getAccounts(): BankAccount[] {
    return this.accounts;
  }

  getAccountById(id: string): BankAccount {
    const account = this.accounts.find((a) => a.id === id);
    if (!account) {
      throw new NotFoundException({
        code: ErrorCodes.ACCOUNT_NOT_FOUND,
        message: 'حساب بانکی یافت نشد',
      });
    }
    return account;
  }

  createAccount(dto: CreateAccountDto): BankAccount {
    const validation = CreateAccountSchema.safeParse(dto);
    if (!validation.success) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'داده‌های حساب نامعتبر است',
        details: validation.error.format(),
      });
    }

    const newAccount: BankAccount = {
      id: crypto.randomUUID(),
      accountNumber: '62198610' + Math.floor(10000000 + Math.random() * 90000000),
      ownerName: dto.ownerName,
      type: dto.type,
      balance: dto.initialDeposit,
      currency: dto.currency,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.accounts.push(newAccount);
    return newAccount;
  }

  transferMoney(dto: TransferMoneyDto): Transaction {
    const validation = TransferMoneySchema.safeParse(dto);
    if (!validation.success) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'داده‌های انتقال نامعتبر است',
        details: validation.error.format(),
      });
    }

    const source = this.getAccountById(dto.fromAccountId);
    const destination = this.getAccountById(dto.toAccountId);

    if (source.balance < dto.amount) {
      throw new BadRequestException({
        code: ErrorCodes.INSUFFICIENT_FUNDS,
        message: 'موجودی حساب مبدا کافی نیست',
      });
    }

    source.balance -= dto.amount;
    destination.balance += dto.amount;

    const tx: Transaction = {
      id: crypto.randomUUID(),
      accountId: source.id,
      type: 'TRANSFER_OUT',
      amount: dto.amount,
      status: 'COMPLETED',
      description: dto.description || 'انتقال وجه بین بانکی',
      timestamp: new Date().toISOString(),
    };

    this.transactions.push(tx);
    return tx;
  }
}
