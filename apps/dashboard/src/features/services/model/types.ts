import type { ServiceRequest, ServiceResponseDto } from '@detaileed/api-client';

/** An active service of the studio, with per-vehicle-size prices and duration. */
export type Service = ServiceResponseDto;
/** Body of `POST/PUT /api/Service`; left-out category, prices and duration are kept on update. */
export type ServiceInput = ServiceRequest;
