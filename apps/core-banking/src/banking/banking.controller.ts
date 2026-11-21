import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BankingService } from './banking.service';
import {
  ApiResponse,
  createSuccessResponse,
  BankAccount,
  Transaction,
  TransferMoneyDto,
  CreateAccountDto,
} from '../contracts';

@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Get('accounts')
  getAccounts(): ApiResponse<BankAccount[]> {
    return createSuccessResponse(this.bankingService.getAccounts());
  }

  @Get('accounts/:id')
  getAccount(@Param('id') id: string): ApiResponse<BankAccount> {
    return createSuccessResponse(this.bankingService.getAccountById(id));
  }

  @Post('accounts')
  createAccount(@Body() dto: CreateAccountDto): ApiResponse<BankAccount> {
    return createSuccessResponse(this.bankingService.createAccount(dto));
  }

  @Post('transfer')
  transfer(@Body() dto: TransferMoneyDto): ApiResponse<Transaction> {
    return createSuccessResponse(this.bankingService.transferMoney(dto));
  }
}
