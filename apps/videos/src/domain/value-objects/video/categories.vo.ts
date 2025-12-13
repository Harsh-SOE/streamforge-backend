import z from 'zod';

import { InvalidCategoriesException } from '@videos/domain/exceptions';

export class VideoCategories {
  private static VideoCategoriesValidationSchema = z.array(
    z.string().min(1, 'category cannot be empty'),
  );

  public constructor(private readonly value: string[]) {}

  public static create(value: string[]) {
    const parsedVideoCategoriesId = this.VideoCategoriesValidationSchema.safeParse(value);
    if (!parsedVideoCategoriesId.success) {
      const errorMessage = parsedVideoCategoriesId.error.message;
      throw new InvalidCategoriesException({
        message: `Video categories validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoCategories(parsedVideoCategoriesId.data);
  }

  public getValue(): string[] {
    return this.value;
  }
}
