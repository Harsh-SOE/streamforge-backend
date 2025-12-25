import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';

import {
  GetPresignedUrlDto,
  GetPreSignedUrlResponse,
  UserChangeNotificationStatusDto,
  UserChangePreferredLanguageDto,
  UserChangePreferredThemeDto,
  UserCreateProfileDto,
  UserNotificationStatusChangedResponse,
  UserPhoneNumberVerifiedResponse,
  UserPreferredLanguageChangedResponse,
  UserPreferredThemeChangedResponse,
  UserProfileCreatedResponse,
  UserProfileUpdatedResponse,
  UserUpdateByIdDto,
  UserUpdateProfileDto,
  UserVerifyPhoneNumberDto,
} from '@app/contracts/users';

import {
  ChangeLanguageCommand,
  ChangeNotificationCommand,
  ChangeThemeCommand,
  CreateProfileCommand,
  GeneratePreSignedUrlCommand,
  UpdateProfileCommand,
  VerifyPhoneNumberCommand,
} from '@users/application/use-cases/commands';

@Injectable()
export class GrpcService {
  constructor(private readonly commandBus: CommandBus) {}

  async generatePreSignedUrl(
    getPresignedUrlDto: GetPresignedUrlDto,
  ): Promise<GetPreSignedUrlResponse> {
    return this.commandBus.execute<GeneratePreSignedUrlCommand, GetPreSignedUrlResponse>(
      new GeneratePreSignedUrlCommand(getPresignedUrlDto),
    );
  }

  async createProfile(
    userCompleteSignupDto: UserCreateProfileDto,
  ): Promise<UserProfileCreatedResponse> {
    return this.commandBus.execute<CreateProfileCommand, UserProfileCreatedResponse>(
      new CreateProfileCommand(userCompleteSignupDto),
    );
  }

  async updateProfile(
    userCompleteProfileDto: UserUpdateProfileDto,
  ): Promise<UserProfileUpdatedResponse> {
    return this.commandBus.execute<UpdateProfileCommand, UserProfileUpdatedResponse>(
      new UpdateProfileCommand(userCompleteProfileDto),
    );
  }

  async changeNotificationStatus(
    userChangeNotificationStatusDto: UserChangeNotificationStatusDto,
  ): Promise<UserNotificationStatusChangedResponse> {
    return this.commandBus.execute<
      ChangeNotificationCommand,
      UserNotificationStatusChangedResponse
    >(new ChangeNotificationCommand(userChangeNotificationStatusDto));
  }

  async changePreferredLanguage(
    userChangePreferredLanguageDto: UserChangePreferredLanguageDto,
  ): Promise<UserPreferredLanguageChangedResponse> {
    return this.commandBus.execute<ChangeLanguageCommand, UserPreferredLanguageChangedResponse>(
      new ChangeLanguageCommand(userChangePreferredLanguageDto),
    );
  }

  async changePreferredTheme(
    userChangePreferredThemeDto: UserChangePreferredThemeDto,
  ): Promise<UserPreferredThemeChangedResponse> {
    return this.commandBus.execute<ChangeThemeCommand, UserPreferredThemeChangedResponse>(
      new ChangeThemeCommand(userChangePreferredThemeDto),
    );
  }

  async changeVerifyPhoneNumber(
    userVerifyPhoneNumberDto: UserVerifyPhoneNumberDto,
  ): Promise<UserPhoneNumberVerifiedResponse> {
    return this.commandBus.execute<VerifyPhoneNumberCommand, UserPhoneNumberVerifiedResponse>(
      new VerifyPhoneNumberCommand(userVerifyPhoneNumberDto),
    );
  }

  async updateUserProfileById(
    userUpdateProfileByIdDto: UserUpdateByIdDto,
  ): Promise<UserProfileUpdatedResponse> {
    return this.commandBus.execute<UpdateProfileCommand, UserProfileUpdatedResponse>(
      new UpdateProfileCommand(userUpdateProfileByIdDto),
    );
  }
}
