import { stableId } from '../store/ids.ts';
import type { CustomerProfile, GarageVehicle } from '../store/types.ts';
import { USER } from './accounts.ts';

/** The demo customer's profile and garage; the same cars are on file at the busy studio. */
export function seedCustomers(): { profiles: CustomerProfile[]; garage: GarageVehicle[] } {
  return {
    profiles: [{ userId: USER.customer, name: 'Marta Zielińska', phone: '+48 601 234 118' }],
    garage: [
      {
        id: stableId('garage:corolla'),
        userId: USER.customer,
        licensePlate: 'WX 4821K',
        brand: 'Toyota',
        model: 'Corolla',
        size: 'Medium',
      },
      {
        id: stableId('garage:xc60'),
        userId: USER.customer,
        licensePlate: 'WI 7753P',
        brand: 'Volvo',
        model: 'XC60',
        size: 'Large',
      },
    ],
  };
}
