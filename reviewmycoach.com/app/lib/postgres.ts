/**
 * PostgreSQL Database Utilities
 * 
 * This module provides a PostgreSQL client and helper functions
 * to replace Firestore operations with PostgreSQL queries.
 */

import { sql } from '@vercel/postgres';

// Re-export sql for direct use
export { sql };

/**
 * Get a document by ID from a collection
 */
export async function getDoc(collection: string, docId: string) {
  // Sanitize table name (only allow alphanumeric and underscores)
  const tableName = collection.replace(/-/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

  // Use template literal for table name (safe after sanitization)
  const query = `SELECT * FROM ${tableName} WHERE id = $1 LIMIT 1`;
  const result = await sql.query(query, [docId]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  // Merge data JSONB with individual columns
  const docData = { ...row.data, ...row };
  delete docData.data; // Remove the data column itself

  return {
    id: row.id,
    exists: true,
    data: () => docData,
  };
}

/**
 * Set a document (create or update)
 */
export async function setDoc(collection: string, docId: string, data: any) {
  // Sanitize table name (only allow alphanumeric and underscores)
  const tableName = collection.replace(/-/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

  // Convert data to PostgreSQL-compatible format
  const convertedData: any = {};
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(data)) {
    convertedData[key] = value;
    const columnName = key.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

    // Try to update individual column if it exists
    updates.push(`${columnName} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  // Insert or update with JSONB
  const insertQuery = `
    INSERT INTO ${tableName} (id, data, updated_at)
    VALUES ($1, $2::jsonb, NOW())
    ON CONFLICT (id)
    DO UPDATE SET
      data = EXCLUDED.data,
      updated_at = NOW()
  `;
  await sql.query(insertQuery, [docId, JSON.stringify(convertedData)]);

  // Try to update individual columns
  if (updates.length > 0) {
    try {
      await sql.query(
        `UPDATE ${tableName} SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
        [...values, docId]
      );
    } catch (error: any) {
      // Columns might not exist, that's okay - data is in JSONB
      if (!error.message?.includes('does not exist')) {
        console.warn(`Warning updating columns:`, error.message);
      }
    }
  }
}

/**
 * Update a document
 */
export async function updateDoc(collection: string, docId: string, data: any) {
  await setDoc(collection, docId, data);
}

/**
 * Delete a document
 */
export async function deleteDoc(collection: string, docId: string) {
  // Sanitize table name (only allow alphanumeric and underscores)
  const tableName = collection.replace(/-/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

  const query = `DELETE FROM ${tableName} WHERE id = $1`;
  await sql.query(query, [docId]);
}

/**
 * Get multiple documents with optional query filters
 */
export async function getDocs(
  collection: string,
  options?: {
    where?: Array<[string, string, any]>; // [field, operator, value]
    orderBy?: Array<[string, 'asc' | 'desc']>;
    limit?: number;
    startAfter?: string;
  }
) {
  const tableName = collection.replace(/-/g, '_');
  
  let query = `SELECT * FROM ${tableName}`;
  const params: any[] = [];
  let paramIndex = 1;
  const conditions: string[] = [];
  
  // Add WHERE conditions
  if (options?.where) {
    for (const [field, operator, value] of options.where) {
      const columnName = field.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      
      if (operator === '==') {
        conditions.push(`(data->>'${field}' = $${paramIndex} OR ${columnName} = $${paramIndex})`);
        params.push(value);
        paramIndex++;
      } else if (operator === '>') {
        conditions.push(`(CAST(data->>'${field}' AS NUMERIC) > $${paramIndex} OR ${columnName} > $${paramIndex})`);
        params.push(value);
        paramIndex++;
      } else if (operator === '<') {
        conditions.push(`(CAST(data->>'${field}' AS NUMERIC) < $${paramIndex} OR ${columnName} < $${paramIndex})`);
        params.push(value);
        paramIndex++;
      } else if (operator === '>=') {
        conditions.push(`(CAST(data->>'${field}' AS NUMERIC) >= $${paramIndex} OR ${columnName} >= $${paramIndex})`);
        params.push(value);
        paramIndex++;
      } else if (operator === '<=') {
        conditions.push(`(CAST(data->>'${field}' AS NUMERIC) <= $${paramIndex} OR ${columnName} <= $${paramIndex})`);
        params.push(value);
        paramIndex++;
      } else if (operator === 'array-contains') {
        conditions.push(`(data->'${field}' @> $${paramIndex}::jsonb OR ${columnName} @> $${paramIndex}::jsonb)`);
        params.push(JSON.stringify([value]));
        paramIndex++;
      }
    }
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  // Add ORDER BY
  if (options?.orderBy) {
    const orderBys = options.orderBy.map(([field, direction]) => {
      const columnName = field.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      return `(data->>'${field}', ${columnName}) ${direction.toUpperCase()}`;
    });
    query += ` ORDER BY ${orderBys.join(', ')}`;
  }
  
  // Add LIMIT
  if (options?.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(options.limit);
    paramIndex++;
  }
  
  const result = await sql.query(query, params);
  
  return {
    empty: result.rows.length === 0,
    docs: result.rows.map((row) => {
      const docData = { ...row.data, ...row };
      delete docData.data;
      return {
        id: row.id,
        data: () => docData,
      };
    }),
  };
}

/**
 * Query helper - similar to Firestore query
 */
export function query(
  collection: string,
  ...queryConstraints: any[]
): any {
  // This is a builder pattern - return an object with get() method
  return {
    get: async () => {
      const options: any = {};
      
      for (const constraint of queryConstraints) {
        if (constraint.type === 'where') {
          if (!options.where) options.where = [];
          options.where.push([constraint.field, constraint.operator, constraint.value]);
        } else if (constraint.type === 'orderBy') {
          if (!options.orderBy) options.orderBy = [];
          options.orderBy.push([constraint.field, constraint.direction]);
        } else if (constraint.type === 'limit') {
          options.limit = constraint.limit;
        }
      }
      
      return getDocs(collection, options);
    },
  };
}

/**
 * Collection reference helper
 */
export function collection(tableName: string) {
  return {
    doc: (docId: string) => ({
      get: () => getDoc(tableName, docId),
      set: (data: any) => setDoc(tableName, docId, data),
      update: (data: any) => updateDoc(tableName, docId, data),
      delete: () => deleteDoc(tableName, docId),
    }),
    where: (field: string, operator: string, value: any) => ({
      type: 'where',
      field,
      operator,
      value,
    }),
    orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
      type: 'orderBy',
      field,
      direction,
    }),
    limit: (count: number) => ({
      type: 'limit',
      limit: count,
    }),
  };
}

/**
 * Document reference helper
 */
export function doc(tableName: string, docId: string) {
  return {
    get: () => getDoc(tableName, docId),
    set: (data: any) => setDoc(tableName, docId, data),
    update: (data: any) => updateDoc(tableName, docId, data),
    delete: () => deleteDoc(tableName, docId),
  };
}

