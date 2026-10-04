export type CarType = "4-seats" | "6-seats" | "16-seats" | "32-seats" | "vip-limousine";

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
  estimatedPrice?: string;
  // Security & Anti-spam honeypot / timestamps
  hp_website?: string;
  submitTimestamp?: number;
}

export interface BookingRecord extends BookingFormInput {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  estimatedPrice?: string;
}
