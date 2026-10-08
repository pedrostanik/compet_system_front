import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { apiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MIN_LENGTH = 8;

export default function ChangePasswordPage() {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const forced = !!user?.mustChangePassword;
  const mismatch = confirm.length > 0 && next !== confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) return;
    setSaving(true);
    try {
      await changePassword(current, next);
      toast.success('Senha alterada. As outras sessões foram encerradas.');
      navigate('/home', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erro ao alterar a senha'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-main)' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-xl border p-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--brand-green)' }}>
            {forced ? 'Defina sua senha' : 'Alterar senha'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {forced
              ? 'Você entrou com uma senha temporária. Escolha uma senha só sua para continuar.'
              : 'Ao trocar a senha, você sai de todos os outros dispositivos.'}
          </p>
        </div>

        <div>
          <Label>{forced ? 'Senha temporária' : 'Senha atual'}</Label>
          <Input type="password" autoComplete="current-password" value={current}
                 onChange={e => setCurrent(e.target.value)} required />
        </div>
        <div>
          <Label>Nova senha</Label>
          <Input type="password" autoComplete="new-password" value={next} minLength={MIN_LENGTH}
                 onChange={e => setNext(e.target.value)} required />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Pelo menos {MIN_LENGTH} caracteres.</p>
        </div>
        <div>
          <Label>Confirme a nova senha</Label>
          <Input type="password" autoComplete="new-password" value={confirm}
                 onChange={e => setConfirm(e.target.value)} required />
          {mismatch && <p className="text-xs mt-1 text-red-600">As senhas não conferem.</p>}
        </div>

        <Button type="submit" disabled={saving || mismatch}>
          {saving ? 'Salvando…' : 'Salvar nova senha'}
        </Button>
        {forced ? (
          <Button type="button" variant="ghost" onClick={() => logout()}>Sair</Button>
        ) : (
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Voltar</Button>
        )}
      </form>
    </div>
  );
}
