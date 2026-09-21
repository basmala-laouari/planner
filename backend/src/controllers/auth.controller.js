// // implement against the schema in schema.sql
import { supabaseAdmin } from '../config/supabase.js';
import { hashKey } from '../utils/crypto.js';

export async function completeProfile(req, res) {
  const { fullName, role, departmentIds, universityIdDocumentUrl } = req.body;

  if (!['student', 'professor'].includes(role)) {
    // admin/superadmin are never self-registered — enforced here too, not just the frontend
    return res.status(400).json({ error: 'Invalid role for self-registration' });
  }
  if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
    return res.status(400).json({ error: 'At least one department is required' });
  }

  const { error: userError } = await supabaseAdmin.from('users').insert({
    id: req.authUser.id,
    full_name: fullName,
    email: req.authUser.email,
    role,
    verification_status: 'pending',
    university_id_document_url: universityIdDocumentUrl ?? null,
  });
  if (userError) return res.status(500).json({ error: userError.message });

  const membershipRows = departmentIds.map((deptId, i) => ({
    user_id: req.authUser.id,
    department_id: deptId,
    is_primary: i === 0,
  }));
  const { error: deptError } = await supabaseAdmin.from('user_departments').insert(membershipRows);
  if (deptError) return res.status(500).json({ error: deptError.message });

  res.status(201).json({ status: 'pending_verification' });
}


export async function redeemAdminKey(req, res) {
  const { key, departmentId, fullName } = req.body;
  if (!key || !departmentId) {
    return res.status(400).json({ error: 'key and departmentId are required' });
  }

  const keyHash = hashKey(key);

  const { data: keyRow, error: keyError } = await supabaseAdmin
    .from('admin_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('department_id', departmentId)
    .eq('email', req.authUser.email) // key only redeems for the email it was issued to
    .is('redeemed_at', null)
    .single();

  if (keyError || !keyRow) {
    return res.status(400).json({ error: 'Invalid admin key' });
  }
  if (new Date(keyRow.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Admin key has expired' });
  }

  // Redeem atomically: the .is('redeemed_at', null) filter means if two
  // requests race on the same key, only one UPDATE actually matches a row.
  const { data: redeemedRows, error: redeemError } = await supabaseAdmin
    .from('admin_keys')
    .update({ redeemed_at: new Date().toISOString() })
    .eq('id', keyRow.id)
    .is('redeemed_at', null)
    .select();

  if (redeemError) return res.status(500).json({ error: redeemError.message });
  if (!redeemedRows?.length) {
    return res.status(409).json({ error: 'Admin key already redeemed' }); // lost the race
  }

  const { error: userError } = await supabaseAdmin.from('users').upsert({
    id: req.authUser.id,
    full_name: fullName,
    email: req.authUser.email,
    role: 'admin',
    verification_status: 'approved', // admins skip the pending-verification step entirely
  });
  if (userError) return res.status(500).json({ error: userError.message });

  const { error: deptError } = await supabaseAdmin.from('user_departments').upsert({
    user_id: req.authUser.id,
    department_id: departmentId,
    is_primary: true,
  });
  if (deptError) return res.status(500).json({ error: deptError.message });

  res.status(200).json({ status: 'admin_approved' });
}


export async function getMe(req, res) {
  res.status(200).json(req.user); // requireAuth already attached the profile row
}
//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaaaaaaaaaa.....fuck
