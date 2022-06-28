const pool = require('../utils/pool');

module.exports = class ToDo {
  id;
  user_id;
  task;
  completed;

  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.task = row.task;
    this.completed = row.completed;
  }

  static async insert({ task, completed, user_id }) {
    const { rows } = await pool.query(
      `
        INSERT INTO todos (task, completed, user_id)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
      [task, completed, user_id]
    );

    return new ToDo(rows[0]);
  }

  static async getAll(user_id) {
    const { rows } = await pool.query(
      'SELECT * from todos where user_id = $1 ORDER BY completed DESC',
      [user_id]
    );
    return rows.map((todo) => new ToDo(todo));
  }
};
