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

  async findAllWithFilters(
    filters: FindTransactionsFilters
  ): Promise<{ lastMonth: any[]; currentMonth: any[] }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
  
    // Definir las tablas (una para el mes anterior y otra para el mes actual)
    const lastMonthTable = 'c_pos_nac_201912';
    const currentMonthTable = 'c_pos_nac_202001';
  
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
  
    // Construir condiciones del filtro
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
  
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
    // Definir la consulta base para ambas tablas
    const buildQuery = (table: string) => `
      SELECT 
        codigo_respuesta, 
        SUBSTRING(dia_y_hora, 1, 2) AS dia,  
        COUNT(*) AS count 
      FROM ${table}
      ${whereClause}
      GROUP BY codigo_respuesta, dia
      ORDER BY codigo_respuesta, dia
    `;
  
    try {
      // Ejecutar ambas consultas en paralelo
      const [lastMonthResult, currentMonthResult] = await Promise.all([
        queryRunner.query(buildQuery(lastMonthTable), queryParams),
        queryRunner.query(buildQuery(currentMonthTable), queryParams),
      ]);
  
      // Función para estructurar los datos en un objeto
      const processResults = (data: any[]) => {
        const groupedData: Record<string, any> = {};
        data.forEach((row) => {
          const codeResponse = row.codigo_respuesta.toString();
          const dayKey = `day${parseInt(row.dia, 10)}`;
          const count = Number(row.count);
  
          if (!groupedData[codeResponse]) {
            groupedData[codeResponse] = { codeResponse };
          }
  
          groupedData[codeResponse][dayKey] = count;
        });
        return Object.values(groupedData);
      };
  
      return {
        lastMonth: processResults(lastMonthResult),
        currentMonth: processResults(currentMonthResult),
      };
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
