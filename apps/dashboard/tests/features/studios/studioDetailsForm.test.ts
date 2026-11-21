import { describe, expect, it } from 'vitest';
import {
  studioDetailsFormDefaults,
  studioDetailsSchema,
  toStudioDetails,
  toStudioDetailsInput,
} from '@/features/studios/model/studioDetailsForm';

const dto = {
  studioId: 's1',
  name: 'Detail Kraków',
  phone: null,
  email: 'kontakt@detail.pl',
  address: 'ul. Długa 1',
  city: 'Kraków',
  latitude: '50.06',
  longitude: 19.94,
  timeZone: 'Europe/Warsaw',
};

describe('studio details form', () => {
  it('turns the pin into numbers and keeps a missing one as null', () => {
    expect(toStudioDetails(dto).latitude).toBe(50.06);
    expect(toStudioDetails({ ...dto, latitude: null, longitude: null }).latitude).toBeNull();
  });

  it('fills the form from the saved details', () => {
    expect(studioDetailsFormDefaults(toStudioDetails(dto))).toEqual({
      name: 'Detail Kraków',
      phone: '',
      email: 'kontakt@detail.pl',
      address: 'ul. Długa 1',
      city: 'Kraków',
      location: { lat: 50.06, lng: 19.94 },
    });
    expect(studioDetailsFormDefaults(toStudioDetails({ ...dto, latitude: null, longitude: null })).location).toBeNull();
  });

  it('accepts details without a pin, but not a bad email or phone', () => {
    const values = studioDetailsFormDefaults(toStudioDetails(dto));
    expect(studioDetailsSchema.safeParse({ ...values, location: null }).success).toBe(true);
    expect(studioDetailsSchema.safeParse({ ...values, email: 'nie-mail' }).success).toBe(false);
    expect(studioDetailsSchema.safeParse({ ...values, phone: '123' }).success).toBe(false);
    expect(studioDetailsSchema.safeParse({ ...values, name: ' ' }).success).toBe(false);
  });

  it('builds the request with empty fields and a missing pin as null', () => {
    const values = studioDetailsSchema.parse({
      name: ' Shine ',
      phone: '',
      email: '',
      address: '',
      city: ' Kraków ',
      location: null,
    });
    expect(toStudioDetailsInput(values)).toEqual({
      name: 'Shine',
      phone: null,
      email: null,
      address: null,
      city: 'Kraków',
      latitude: null,
      longitude: null,
    });
  });
});
