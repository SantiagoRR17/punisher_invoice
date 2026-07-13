export type TratamientoCliente = "Señor" | "Señora";

export interface ClienteCotizacion {
  tratamiento: TratamientoCliente;
  nombre: string;
  cedula: string;
  direccion: string;
  barrio: string;
}

export interface ItemCotizacion {
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
}

export interface Cotizacion {
  _id?: string;
  cliente: ClienteCotizacion;
  items: ItemCotizacion[];
  fecha: Date;
  total: number;
  createdAt: Date;
}
