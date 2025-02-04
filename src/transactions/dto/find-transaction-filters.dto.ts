import { IsOptional, IsArray, IsString } from 'class-validator';

export class FindTransactionsFilters {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kq2_id_medio_acceso?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dia_y_hora?: string | string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  codigo_respuesta?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fiid_comer?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fiid_tarj?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ln_comer?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ln_tarj?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entry_mode?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tipo_transac?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tipo_term?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kc0_indicador_de_comercio_elec?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kb4_arqc_vrfy?: string[] | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  r?: string[] | string;
}
