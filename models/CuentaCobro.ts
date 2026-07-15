export type TratamientoCliente = "Señor" | "Señora";

export interface ClienteCuentaCobro {
  tratamiento: TratamientoCliente;
  nombre: string;
  cedula: string;
  direccion: string;
  celular: string;
}

export interface ItemCuentaCobro {
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
}

export interface AbonoCuentaCobro {
  valor: number;
  fecha: Date;
}

export interface CuentaCobro {
  _id?: string;
  consecutivo: string;
  anio: number;
  numero: number;
  cliente: ClienteCuentaCobro;
  items: ItemCuentaCobro[];
  total: number;
  abonos: AbonoCuentaCobro[];
  saldo: number;
  fecha: Date;
  createdAt: Date;
}
