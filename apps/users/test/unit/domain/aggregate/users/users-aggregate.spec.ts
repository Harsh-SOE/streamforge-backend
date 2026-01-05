import {
  InvalidAvatarUrlException,
  InvalidDobException,
  InvalidPhoneNumberException,
} from '@users/domain/exceptions';
import { UserAggregate } from '@users/domain/aggregates';
import { ProfileUpdatedDomainEvent } from '@users/domain/domain-events';

describe('UserAggregate', () => {
  let userAggregate: UserAggregate;
  beforeEach(() => {
    userAggregate = UserAggregate.create({
      userAuthId: 'authId',
      handle: 'Handle',
      email: 'test@example.com',
      avatarUrl: 'https://test-avatar.com?avatar=test-avatar',
    });
  });

  it('should update profile when valid inputs were given', () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);

    userAggregate.updateUserProfile({
      dob: date,
      phoneNumber: '+919876543210',
      avatar: 'https://test-avatar.com?avatar=updated-avatar',
    });

    const events = userAggregate.getUncommittedEvents();
    expect(events).toHaveLength(2);
    expect(events[1]).toBeInstanceOf(ProfileUpdatedDomainEvent);
    expect(userAggregate.getUserSnapshot().avatarUrl).toBe(
      'https://test-avatar.com?avatar=updated-avatar',
    );
    expect(userAggregate.getUserSnapshot().dob).toStrictEqual(date);
    expect(userAggregate.getUserSnapshot().phoneNumber).toBe('+919876543210');
  });

  it('should throw InvalidDOBException when invalid date is given', () => {
    const date = new Date();

    expect(() => {
      userAggregate.updateUserProfile({
        dob: date,
        phoneNumber: '+919876543210',
        avatar: 'https://test-avatar.com?avatar=updated-avatar',
      });
    }).toThrow(InvalidDobException);
  });

  it('should throw InvalidAvatarUrlException when invalid avatar Url is given', () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);

    expect(() => {
      userAggregate.updateUserProfile({
        dob: date,
        phoneNumber: '+919876543210',
        avatar: 'invalid-avatar-url',
      });
    }).toThrow(InvalidAvatarUrlException);
  });

  it('should throw InvalidPhoneNumberException when invalid Phone Number is given', () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);

    expect(() => {
      userAggregate.updateUserProfile({
        dob: date,
        phoneNumber: 'invalid-phone-number',
        avatar: 'invalid-avatar-url',
      });
    }).toThrow(InvalidPhoneNumberException);
  });
});
