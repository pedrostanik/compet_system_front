export type SpecieType = string;
export type CoatType = string;
export type ProductCategory = 'ROU' | 'ACE' | 'BRI' | 'CAM' | 'HIG' | 'ALI' | 'OUT';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ON_DEMAND' | 'DISCONTINUED';
export type AnimalTarget = 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'RODENT' | 'REPTILE' | 'ALL';
export type ReceiptType = 'PRODUCT' | 'SERVICE';
export type ReceiptStatus = 'PENDING' | 'PAID' | 'CANCELLED';


export interface Pet {
  id: number;
  name: string;
  age: number;
  species: SpecieType;
  race: string;
  rabieVaccination?: boolean;
  rabieVaccinationDate?: string;
  v10Vaccination?: boolean;
  v10VaccinationDate?: string;
  dewormed?: boolean;
  dewormedDate?: string;
  allergy?: string;
  healthIssues?: string;
  weight?: number;
  coatType?: CoatType;
  observations?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address?: string;
  pets: Pet[];
}

export interface CustomerRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  cpf: string;
}

export interface PetRequest {
  name: string;
  age: number;
  species: SpecieType | '';
  race: string;
  rabieVaccination?: boolean;
  rabieVaccinationDate?: string;
  v10Vaccination?: boolean;
  v10VaccinationDate?: string;
  dewormed?: boolean;
  dewormedDate?: string;
  allergy?: string;
  healthIssues?: string;
  weight?: number;
  coatType?: CoatType | '';
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

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ROU: 'Roupinhas / Fantasias',
  ACE: 'Acessórios',
  BRI: 'Brinquedos',
  CAM: 'Camas / Almofadas',
  HIG: 'Higiene',
  ALI: 'Alimentos',
  OUT: 'Outros',
};

export interface SupplierSummary {
  id: number;
  code: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  barcode?: string;
  category: ProductCategory;
  animalTarget: AnimalTarget;
  brand?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  margin: number;
  currentStockQty: number;
  minStockQty: number;
  isBelowMinStock: boolean;
  shelfLocation?: string;
  ncm?: string;
  loose: boolean;
  status: ProductStatus;
  supplier?: SupplierSummary;
  size?: string;
  color?: string;
  createdAt: string;
}

export interface ProductRequest {
  name: string;
  category: ProductCategory | '';
  animalTarget: AnimalTarget | '';
  brand?: string;
  unit: string;
  costPrice: number | '';
  salePrice: number | '';
  barcode?: string;
  minStockQty: number | '';
  currentStockQty: number | '';
  shelfLocation?: string;
  ncm?: string;
  loose: boolean;
  size?: string;
  color?: string;
  supplierId?: number;
}

export interface ReceiptItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  productId?: number;
  productSku?: string;
}

export interface ReceiptRequest {
  type: ReceiptType;
  customerId?: number;
  customerName: string;
  petId?: number;
  petName?: string;
  schedulingId?: number;
  observations?: string;
  discount?: number;
  items: ReceiptItemRequest[];
}

export interface ReceiptItemResponse {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productId?: number;
  productSku?: string;
}

export interface ReceiptResponse {
  id: number;
  number: string;
  type: ReceiptType;
  status: ReceiptStatus;
  customerId?: number;
  customerName: string;
  petId?: number;
  petName?: string;
  schedulingId?: number;
  observations?: string;
  discount: number;
  subtotal: number;
  total: number;
  items: ReceiptItemResponse[];
  createdAt: string;
}

