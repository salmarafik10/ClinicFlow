export interface Patient {
  id: string;
  fullName: string;
  cin: string;
  phone: string;
  birthDate: string;
  address: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}