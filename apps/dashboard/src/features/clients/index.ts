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
export { default as ClientsView } from './components/ClientsView';
export { default as CreateClientModal } from './components/CreateClientModal';
export { default as VehicleModal } from './components/VehicleModal';
export { default as AddVehicleModal } from './components/AddVehicleModal';
export { clientFormSchema, vehicleFormSchema } from './model/schemas';
export type { ClientFormValues, VehicleFormValues } from './model/schemas';
