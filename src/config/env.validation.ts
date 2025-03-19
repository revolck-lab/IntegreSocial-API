import { plainToClass } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  NODE_ENV: string;

  @IsNumber()
  @Min(1)
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  @Min(60)
  JWT_EXPIRATION: number;

  @IsNumber()
  @Min(60 * 24 * 7)
  JWT_REFRESH_EXPIRATION: number;

  @IsString()
  @IsOptional()
  CORS_ORIGINS: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  THROTTLE_TTL: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  THROTTLE_LIMIT: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
