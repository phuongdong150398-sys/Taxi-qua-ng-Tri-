export type CarType = "4-seats" | "7-seats" | "16-seats" | "vip-limousine";

export type TripType = "one-way" | "round-trip";

export type ServiceType = "airport" | "provincial" | "city" | "convenient" | "tour";

export interface BookingFormInput {
  fullName: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  carType: CarType;
  tripType: TripType;
  serviceType: ServiceType;
  notes?: string;
}

export interface BookingRecord extends BookingFormInput {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  estimatedPrice?: string;
}
