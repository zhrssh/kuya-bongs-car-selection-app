/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Car } from './types';

const API_BASE_URL = (import.meta.env as any).VITE_FLASK_APP_API_URL;

export async function fetchCars(): Promise<Car[]> {
  const response = await fetch(`${API_BASE_URL}/api/cars`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cars');
  }

  const data = await response.json();
  return data.data.cars;
}
