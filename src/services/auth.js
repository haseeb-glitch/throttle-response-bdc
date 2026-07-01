const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'throttleresponse-secret-2026';
const JWT_EXPIRES = '24h';

async function createUser(username, password, role = 'staff') {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password_hash: passwordHash, role }])
    .select()
    .single();

  if (error) throw error;
  return { id: data.id, username: data.username, role: data.role };
}

async function loginUser(username, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) throw new Error('Invalid username or password');

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) throw new Error('Invalid username or password');

  // Last login update karo
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.id);

  const token = jwt.sign(
    { id: data.id, username: data.username, role: data.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return {
    token,
    user: { id: data.id, username: data.username, role: data.role }
  };
}

async function changePassword(userId, oldPassword, newPassword) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) throw new Error('User not found');

  const valid = await bcrypt.compare(oldPassword, data.password_hash);
  if (!valid) throw new Error('Current password is incorrect');

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', data.id);

  if (updateError) throw updateError;
  return { success: true };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { createUser, loginUser, changePassword, verifyToken };