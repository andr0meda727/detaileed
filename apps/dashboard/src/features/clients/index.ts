export {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from './api/clients';
export { useClientSearch, useClientVehicleSearch } from './hooks/useClientVehicleSearch';
export type { ClientVehicleMatch } from './hooks/useClientVehicleSearch';
export type { Client, ClientInput, Vehicle, VehicleInput } from './model/types';
export { ClientsView } from './components/ClientsView';
export { CreateClientModal } from './components/CreateClientModal';
export { VehicleModal } from './components/VehicleModal';
export { AddVehicleModal } from './components/AddVehicleModal';
export { clientFormSchema, vehicleFormSchema } from './model/schemas';
export type { ClientFormValues, VehicleFormValues } from './model/schemas';
export { ClientVehiclePicker } from './components/ClientVehiclePicker';
