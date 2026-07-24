export type TratamientoCliente = "Señor" | "Señora";

export type TipoDocumento = "CC" | "NIT";

export interface ClienteCotizacion {
  tipoDocumento: TipoDocumento;
  tratamiento: TratamientoCliente;
  nombre: string;
  cedula: string;
  direccion: string;
  celular: string;
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
