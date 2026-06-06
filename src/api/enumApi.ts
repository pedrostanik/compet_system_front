import api from './axios';

export interface EnumOption {
  value: string;
  label: string;
}

export const getSpecies = () =>
  api.get<EnumOption[]>('/api/enums/species').then(r => r.data);

export const getCoatTypes = () =>
  api.get<EnumOption[]>('/api/enums/coat-types').then(r => r.data);

export const getCatBreeds = () =>
  api.get<EnumOption[]>('/api/enums/cat-breeds').then(r => r.data);

 export const getDogBreeds = () =>
   api.get<EnumOption[]>('/api/enums/dog-breeds').then(r => r.data);