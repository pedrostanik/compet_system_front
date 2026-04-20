export interface Pet {
  id: number;
  name: string;
  age: number;
  species: string;
  race: string;
  observations?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  pets: Pet[];
}

export interface CustomerRequest {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface PetRequest {
  name: string;
  age: number;
  species: string;
  race: string;
  observations?: string;
}
