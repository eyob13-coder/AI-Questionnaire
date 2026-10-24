import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PurchaseType } from '../billing.constants';

export class CreateCheckoutDto {
  @IsEnum(PurchaseType, { message: 'purchaseType must be either SINGLE_PASS or PRO_SUBSCRIPTION' })
  purchaseType: PurchaseType;

  @IsOptional()
  @IsString()
  questionnaireId?: string;

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;
}
