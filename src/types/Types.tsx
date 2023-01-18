export type MarkerType = {
  title: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  image: string;
  device: {
    available: number;
    free_slot: number;
  };
};

export type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type RentalType = {
  //Property
  id: number;
  deviceId: string;
  umbrellaId: string;
  discount?: number;
  //Rental Time
  status: string;
  startTime: Date;
  endTime?: Date;
  //Price
  rate: number;
  totalHours?: number;
  totalPrice?: number;
  //date
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionType = {
  id: number;
  userId: number;
  amount: number;
  type: "debit" | "credit";
  status: string;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}
