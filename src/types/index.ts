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

export interface Pet {
  id: number;
  name: string;
  age: number;
  species: string;
  race: string;
  observations?: string;
}

export interface Protocol {
    id: number;
    name: string;
    description: string;
    price?: number;

}

export interface ProtocolRequest {
    name: string;
    price?: number;
    description: string;

}

export interface SchedulingProtocol {
  protocolId: number;
  protocolName: string;
  protocolPrice: number;
}


export interface PackProtocol {
  protocolId: number;
  protocolName: string;
  protocolDescription: string;
}

export interface Pack {
  id: number;
  petId: number;
  petName: string;
  customerId: number;
  customerName: string;
  protocols: PackProtocol[];
}

export interface PackRequest {
  petId: number;
  petName: string;
  customerId: number;
  customerName: string;
  protocolIds: number[];
}

