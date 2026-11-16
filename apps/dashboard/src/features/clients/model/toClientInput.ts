import type { ClientVehicleRequest } from '@detaileed/api-client';
import type { ClientInput } from '@/features/clients/model/types';
import type { NewClientWithVehicleValues, VehicleFormValues } from '@/features/clients/model/schemas';

/** Vehicle form values as the API expects them: upper-case plate, empty optional fields as null, the size. */
export function toVehicleFields(values: VehicleFormValues): ClientVehicleRequest {
  return {
    licensePlate: values.licensePlate.trim().toUpperCase(),
    brand: values.brand?.trim() || null,
    model: values.model?.trim() || null,
    size: values.size,
  };
}

/** Body of `POST /api/Clients` for a new client created together with a vehicle. */
export function toNewClientInput(values: NewClientWithVehicleValues): ClientInput {
  return {
    name: values.name.trim(),
    phone: values.phone.trim(),
    email: values.email || null,
    nip: values.nip || null,
    vehicle: toVehicleFields(values.vehicle),
  };
}
