import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform<T, T> {
  constructor(private schema: ZodType<T>) {}

  transform(value: T, metadata: ArgumentMetadata): T {
    console.log('meta data ' + metadata);
    const parsedValue = this.schema.parse(value);
    console.log('value after parsing ' + parsedValue);
    return parsedValue;
  }
}
