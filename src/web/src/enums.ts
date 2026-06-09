export enum CarStatus {
  Available = "available",
  Sold = "sold",
  Archived = "archived",
}

export const CarStatusLabel: Record<CarStatus, string> = {
  [CarStatus.Available]: "Available",
  [CarStatus.Sold]: "Sold",
  [CarStatus.Archived]: "Archived",
};

export enum CarFuelType {
  Gasoline = "gasoline",
  Electric = "electric",
  Hybrid = "hybrid",
  Diesel = "diesel",
}

export const CarFuelTypeLabel: Record<CarFuelType, string> = {
  [CarFuelType.Gasoline]: "Gasoline",
  [CarFuelType.Electric]: "Electric",
  [CarFuelType.Hybrid]: "Hybrid",
  [CarFuelType.Diesel]: "Diesel",
};

export enum CarTransmission {
  Automatic = "automatic",
  Manual = "manual",
}

export const CarTransmissionLabel: Record<CarTransmission, string> = {
  [CarTransmission.Automatic]: "Automatic",
  [CarTransmission.Manual]: "Manual",
};

export enum CarBodyType {
  Sedan = "sedan",
  SUV = "suv",
  Truck = "truck",
  Hatchback = "hatchback",
  Coupe = "coupe",
  Convertible = "convertible",
  Van = "van",
  Wagon = "wagon",
}

export const CarBodyTypeLabel: Record<CarBodyType, string> = {
  [CarBodyType.Sedan]: "Sedan",
  [CarBodyType.SUV]: "SUV",
  [CarBodyType.Truck]: "Truck",
  [CarBodyType.Hatchback]: "Hatchback",
  [CarBodyType.Coupe]: "Coupe",
  [CarBodyType.Convertible]: "Convertible",
  [CarBodyType.Van]: "Van",
  [CarBodyType.Wagon]: "Wagon",
};

export enum CarCondition {
  Excellent = "excellent",
  VeryGood = "very good",
  Good = "good",
}

export const CarConditionLabel: Record<CarCondition, string> = {
  [CarCondition.Excellent]: "Excellent",
  [CarCondition.VeryGood]: "Very Good",
  [CarCondition.Good]: "Good",
};