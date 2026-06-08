/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Car } from "./types";

const API_BASE_URL = (import.meta.env as any).VITE_FLASK_APP_API_URL;

export async function fetchCars(): Promise<Car[]> {
  const response = await fetch(`${API_BASE_URL}/api/cars`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cars");
  }

  const data = await response.json();
  return data.data.cars;
}

export async function sendEmail(
  car: Car,
  userName: String,
  userEmail: String,
  message: String,
  interestType: String,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cars/${car.id}/inquire`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_name: userName,
      sender_email: userEmail,
      message: message,
      interest_type: interestType,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send inquiry");
  }
}
