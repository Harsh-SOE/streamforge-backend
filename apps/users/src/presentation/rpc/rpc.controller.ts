import { Observable } from 'rxjs';
import { Controller, UseFilters } from '@nestjs/common';

import {
  UserServiceController,
  UserServiceControllerMethods,
  UserChangeNotificationStatusDto,
  UserChangePreferredLanguageDto,
  UserChangePreferredThemeDto,
  UserNotificationStatusChangedResponse,
  UserPhoneNumberVerifiedResponse,
  UserPreferredLanguageChangedResponse,
  UserPreferredThemeChangedResponse,
  UserProfileUpdatedResponse,
  UserUpdateByIdDto,
  UserVerifyPhoneNumberDto,
  UserUpdateProfileDto,
  UserCreateProfileDto,
  UserProfileCreatedResponse,
  GetPresignedUrlDto,
  GetPreSignedUrlResponse,
} from '@app/contracts/users';

import { GrpcFilter } from '../filters';
import { RpcService } from './rpc.service';

@Controller()
@UseFilters(GrpcFilter)
@UserServiceControllerMethods()
export class RpcController implements UserServiceController {
  constructor(private readonly userService: RpcService) {}

  getPresignedUrlForFileUpload(
    getPresignedUrlDto: GetPresignedUrlDto,
  ):
    | Promise<GetPreSignedUrlResponse>
    | Observable<GetPreSignedUrlResponse>
    | GetPreSignedUrlResponse {
    return this.userService.generatePreSignedUrl(getPresignedUrlDto);
  }

  createProfile(
    userCompleteSignupDto: UserCreateProfileDto,
  ):
    | Promise<UserProfileCreatedResponse>
    | Observable<UserProfileCreatedResponse>
    | UserProfileCreatedResponse {
    return this.userService.createProfile(userCompleteSignupDto);
  }

  updateProfile(
    userUpdateProfileDto: UserUpdateProfileDto,
  ):
    | Promise<UserProfileUpdatedResponse>
    | Observable<UserProfileUpdatedResponse>
    | UserProfileUpdatedResponse {
    return this.userService.updateProfile(userUpdateProfileDto);
  }

  changeNotificationStatus(
    userChangeNotificationStatusDto: UserChangeNotificationStatusDto,
  ):
    | Promise<UserNotificationStatusChangedResponse>
    | Observable<UserNotificationStatusChangedResponse>
    | UserNotificationStatusChangedResponse {
    return this.changeNotificationStatus(userChangeNotificationStatusDto);
  }

  changePreferredLanguage(
    userChangePreferredLanguageDto: UserChangePreferredLanguageDto,
  ):
    | Promise<UserPreferredLanguageChangedResponse>
    | Observable<UserPreferredLanguageChangedResponse>
    | UserPreferredLanguageChangedResponse {
    return this.changePreferredLanguage(userChangePreferredLanguageDto);
  }

  changePreferredTheme(
    userChangePreferredThemeDto: UserChangePreferredThemeDto,
  ):
    | Promise<UserPreferredThemeChangedResponse>
    | Observable<UserPreferredThemeChangedResponse>
    | UserPreferredThemeChangedResponse {
    return this.changePreferredTheme(userChangePreferredThemeDto);
  }

  verifyPhoneNumber(
    userVerifyPhoneNumberDto: UserVerifyPhoneNumberDto,
  ):
    | Promise<UserPhoneNumberVerifiedResponse>
    | Observable<UserPhoneNumberVerifiedResponse>
    | UserPhoneNumberVerifiedResponse {
    return this.verifyPhoneNumber(userVerifyPhoneNumberDto);
  }

  updateUserProfileById(
    userUpdateByIdDto: UserUpdateByIdDto,
  ):
    | Promise<UserProfileUpdatedResponse>
    | Observable<UserProfileUpdatedResponse>
    | UserProfileUpdatedResponse {
    return this.userService.updateUserProfileById(userUpdateByIdDto);
  }
}
