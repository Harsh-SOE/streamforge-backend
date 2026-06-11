import z from 'zod';

import { InvalidValueObjectException } from '@videos/domain/exceptions';

export class HlsManifestIdentifier {
  private static HlsManifestIdentifierValidationSchema = z.string().optional();

  public constructor(private readonly value?: string) {}

  public static create(value?: string) {
    const parsedHlsManifestIdentifier = this.HlsManifestIdentifierValidationSchema.safeParse(value);
    if (!parsedHlsManifestIdentifier.success) {
      const errorMessage = parsedHlsManifestIdentifier.error.message;
      throw new InvalidValueObjectException({
        message: `HLS file identifier validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new HlsManifestIdentifier(parsedHlsManifestIdentifier.data);
  }

  public getValue() {
    return this.value;
  }
}
