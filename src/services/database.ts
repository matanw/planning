// Database connection and storage layer for PostgreSQL
import { Pool, PoolClient } from 'pg';
import { Task, CreateTaskData, UpdateTaskData, TaskFilters, TaskSortOptions, DatabaseConfig } from '../types/task';

class DatabaseService {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('Connected to PostgreSQL database');
      client.release();
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  // Task CRUD operations
  async createTask(taskData: CreateTaskData): Promise<Task> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO tasks (title, description, status, deadline, parent_id, labels, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [
        taskData.title,
        taskData.description || null,
        taskData.status || 'not_started',
        taskData.deadline || null,
        taskData.parent_id || null,
        taskData.labels || [],
        taskData.priority || 0
      ];

      const result = await client.query(query, values);
      return this.mapRowToTask(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getTask(id: number): Promise<Task | null> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM tasks WHERE id = $1';
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToTask(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async updateTask(id: number, taskData: UpdateTaskData): Promise<Task | null> {
    const client = await this.pool.connect();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.entries(taskData).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        return await this.getTask(id);
      }

      const query = `
        UPDATE tasks 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      values.push(id);

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToTask(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const query = 'DELETE FROM tasks WHERE id = $1';
      const result = await client.query(query, [id]);
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  async getAllTasks(): Promise<Task[]> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
      const result = await client.query(query);
      return result.rows.map(row => this.mapRowToTask(row));
    } finally {
      client.release();
    }
  }

  async getTasksWithFilters(filters: TaskFilters, sortOptions?: TaskSortOptions): Promise<Task[]> {
    const client = await this.pool.connect();
    try {
      let query = 'SELECT * FROM tasks WHERE 1=1';
      const values = [];
      let paramCount = 1;

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query += ` AND status = ANY($${paramCount})`;
        values.push(filters.status);
        paramCount++;
      }

      if (filters.labels && filters.labels.length > 0) {
        query += ` AND labels && $${paramCount}`;
        values.push(filters.labels);
        paramCount++;
      }

      if (filters.priority && filters.priority.length > 0) {
        query += ` AND priority = ANY($${paramCount})`;
        values.push(filters.priority);
        paramCount++;
      }

      if (filters.deadlineRange) {
        if (filters.deadlineRange.start) {
          query += ` AND deadline >= $${paramCount}`;
          values.push(filters.deadlineRange.start);
          paramCount++;
        }
        if (filters.deadlineRange.end) {
          query += ` AND deadline <= $${paramCount}`;
          values.push(filters.deadlineRange.end);
          paramCount++;
        }
      }

      if (filters.searchText) {
        query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        values.push(`%${filters.searchText}%`);
        paramCount++;
      }

      // Apply sorting
      if (sortOptions) {
        query += ` ORDER BY ${sortOptions.field} ${sortOptions.direction.toUpperCase()}`;
      } else {
        query += ' ORDER BY created_at DESC';
      }

      const result = await client.query(query, values);
      return result.rows.map(row => this.mapRowToTask(row));
    } finally {
      client.release();
    }
  }

  async getRootTasks(): Promise<Task[]> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM tasks WHERE parent_id IS NULL ORDER BY created_at DESC';
      const result = await client.query(query);
      return result.rows.map(row => this.mapRowToTask(row));
    } finally {
      client.release();
    }
  }

  async getChildTasks(parentId: number): Promise<Task[]> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM tasks WHERE parent_id = $1 ORDER BY created_at DESC';
      const result = await client.query(query, [parentId]);
      return result.rows.map(row => this.mapRowToTask(row));
    } finally {
      client.release();
    }
  }

  // Helper method to map database row to Task object
  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      deadline: row.deadline ? new Date(row.deadline) : undefined,
      parent_id: row.parent_id,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      labels: row.labels || [],
      priority: row.priority || 0
    };
  }

  // Initialize database schema
  async initializeSchema(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Read and execute the schema file
      const fs = await import('fs');
      const path = await import('path');
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      await client.query(schema);
      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Error initializing database schema:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export default DatabaseService;
