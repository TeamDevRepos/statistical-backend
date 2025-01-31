import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FindTransactionsFilters } from './dto/find-transaction-filters.dto';

@Injectable()
export class TransactionsService {
  constructor(@InjectDataSource('remote') private dataSource: DataSource) {}

  create(createTransactionDto: CreateTransactionDto) {
    return 'This action adds a new transaction';
  }

  async findAllWithFilters(filters: FindTransactionsFilters): Promise<any[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    let query = `
      SELECT 
        codigo_respuesta, 
        SUBSTRING(dia_y_hora, 1, 2) AS dia,  
        COUNT(*) as count 
      FROM c_pos_nac_202001
    `;

    const queryParams: any[] = [];
    const conditions: string[] = [];

    const filterMap: Record<string, string> = {
      kq2_id_medio_acceso: 'kq2_id_medio_acceso',
      dia_y_hora: 'dia_y_hora',
      codigo_respuesta: 'codigo_respuesta',
      fiid_comer: 'fiid_comer',
      fiid_tarj: 'fiid_tarj',
      ln_comer: 'ln_comer',
      ln_tarj: 'ln_tarj',
      entry_mode: 'entry_mode',
      tipo_transac: 'tipo_transac',
      tipo_term: 'tipo_term',
      kc0_indicador_de_comercio_elec: 'kc0_indicador_de_comercio_elec',
      kb4_arqc_vrfy: 'kb4_arqc_vrfy',
    };

    for (const [filterKey, columnName] of Object.entries(filterMap)) {
      if (filters[filterKey]) {
        const filterValues = Array.isArray(filters[filterKey])
          ? filters[filterKey]
          : [filters[filterKey]];
        
        const placeholders = filterValues
          .map((_, index) => `$${queryParams.length + index + 1}`)
          .join(', ');

        conditions.push(`${columnName} IN (${placeholders})`);
        queryParams.push(...filterValues);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY codigo_respuesta, dia ORDER BY codigo_respuesta, dia';

    try {
      const result = await queryRunner.query(query, queryParams);

      const groupedData: Record<string, any> = {};

      result.forEach((row: any) => {
        const codigoRespuesta = row.codigo_respuesta.toString();
        const dia = `dia${parseInt(row.dia, 10)}`;
        const count = Number(row.count);

        if (!groupedData[codigoRespuesta]) {
          groupedData[codigoRespuesta] = { codigo_respuesta: codigoRespuesta };
        }

        groupedData[codigoRespuesta][dia] = count;
      });

      return Object.values(groupedData); // Convertimos el objeto en un array
    } catch (err) {
      throw new Error(`Error al ejecutar la consulta: ${err}`);
    } finally {
      await queryRunner.release();
    }
}

  
  

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
