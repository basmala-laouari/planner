// TODO: implement against the schema in schema.sql
import { supabaseAdmin } from '../config/supabase.js';


export async function listDepartments(req, res) {
  const { data, error } = await supabaseAdmin
    .from('departments')
    .select('id, name')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}

export async function createDepartment(req, res) {
  res.status(501).json({ error: 'Not implemented yet' });
}
