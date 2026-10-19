import { requireSupabase, isAdmin } from '../lib/supabase';
export async function login(email, password) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!isAdmin(data.session)) {
    await client.auth.signOut();
    throw new Error('This account does not have portfolio admin access.');
  }
  return true;
}
export async function logout() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}
export async function changePassword(currentPassword, newPassword) {
  const client = requireSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('Please sign in again.');
  if (newPassword.length < 8) throw new Error('Use at least 8 characters.');
  await login(user.email, currentPassword);
  const { error: updateError } = await client.auth.updateUser({ password: newPassword });
  if (updateError) throw updateError;
  return true;
}
