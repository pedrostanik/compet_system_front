import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createUser, getUsers, resetUserPassword, updateUser } from '@/api/authApi';
import { apiErrorMessage } from '@/api/errors';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Role, UserAccount } from '@/types';

const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  STAFF: 'Equipe (sem financeiro)',
  VIEWER: 'Somente leitura',
};

/** A readable random temporary password, e.g. "pet-7342-kqzt" (crypto-random; replaced at first login). */
function generatePassword() {
  const [a, b] = crypto.getRandomValues(new Uint32Array(2));
  const digits = 1000 + (a % 9000);
  const letters = (b % 36 ** 4).toString(36).padStart(4, '0');
  return `pet-${digits}-${letters}`;
}

type DialogState =
  | { kind: 'create' }
  | { kind: 'edit'; user: UserAccount }
  | { kind: 'reset'; user: UserAccount }
  | null;

export default function UsersPage() {
  const { user: me, hasRole } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [dialog, setDialog] = useState<DialogState>(null);

  // Only an OWNER may grant (or manage) the OWNER role.
  const assignableRoles: Role[] = hasRole('OWNER') ? ['OWNER', 'ADMIN', 'STAFF', 'VIEWER'] : ['ADMIN', 'STAFF', 'VIEWER'];

  // Bumped after every change to reload the list.
  const [version, setVersion] = useState(0);
  const load = useCallback(() => setVersion(v => v + 1), []);

  useEffect(() => {
    let active = true;
    getUsers()
      .then(list => active && setUsers(list))
      .catch(err => toast.error(apiErrorMessage(err, 'Erro ao carregar usuários')));
    return () => {
      active = false;
    };
  }, [version]);

  const canManage = (u: UserAccount) => u.role !== 'OWNER' || hasRole('OWNER');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Usuários</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Quem acessa o sistema. A equipe não vê recibos nem relatórios financeiros.
          </p>
        </div>
        <Button onClick={() => setDialog({ kind: 'create' })}>Novo usuário</Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className={u.status === 'DISABLED' ? 'opacity-50' : ''}>
                <TableCell>{u.name}{u.id === me?.id && ' (você)'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{ROLE_LABELS[u.role]}</TableCell>
                <TableCell>
                  {u.status === 'DISABLED' ? 'Desativado' : u.mustChangePassword ? 'Aguardando nova senha' : 'Ativo'}
                </TableCell>
                <TableCell>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('pt-BR') : '—'}</TableCell>
                <TableCell>
                  {canManage(u) && (
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setDialog({ kind: 'edit', user: u })}>
                        Editar
                      </Button>
                      {u.id !== me?.id && (
                        <Button variant="outline" size="sm" onClick={() => setDialog({ kind: 'reset', user: u })}>
                          Redefinir senha
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialog !== null} onOpenChange={open => !open && setDialog(null)}>
        <DialogContent>
          {dialog?.kind === 'create' && (
            <CreateUserForm roles={assignableRoles}
                            onDone={() => { setDialog(null); load(); }} />
          )}
          {dialog?.kind === 'edit' && (
            <EditUserForm user={dialog.user} isSelf={dialog.user.id === me?.id}
                          roles={dialog.user.role === 'OWNER' ? ['OWNER', ...assignableRoles.filter(r => r !== 'OWNER')] : assignableRoles}
                          onDone={() => { setDialog(null); load(); }} />
          )}
          {dialog?.kind === 'reset' && (
            <ResetPasswordForm user={dialog.user} onDone={() => { setDialog(null); load(); }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoleSelect({ value, roles, onChange, disabled }: {
  value: Role; roles: Role[]; onChange: (r: Role) => void; disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={v => onChange(v as Role)} disabled={disabled}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {roles.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function CreateUserForm({ roles, onDone }: { roles: Role[]; onDone: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('STAFF');
  const [temporaryPassword, setTemporaryPassword] = useState(generatePassword);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createUser({ name, email, role, temporaryPassword });
      toast.success(`Usuário criado. Senha temporária: ${temporaryPassword}`, { duration: 15000 });
      onDone();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erro ao criar usuário'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <DialogHeader><DialogTitle>Novo usuário</DialogTitle></DialogHeader>
      <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
      <div><Label>E-mail (usado para entrar)</Label>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <div><Label>Perfil</Label><RoleSelect value={role} roles={roles} onChange={setRole} /></div>
      <div>
        <Label>Senha temporária</Label>
        <Input value={temporaryPassword} onChange={e => setTemporaryPassword(e.target.value)} minLength={8} required />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Passe esta senha para a pessoa; ela terá de criar a própria no primeiro acesso.
        </p>
      </div>
      <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Criar usuário'}</Button>
    </form>
  );
}

function EditUserForm({ user, roles, isSelf, onDone }: {
  user: UserAccount; roles: Role[]; isSelf: boolean; onDone: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<Role>(user.role);
  const [status, setStatus] = useState<UserAccount['status']>(user.status);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(user.id, { name, role, status });
      toast.success('Usuário atualizado');
      onDone();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erro ao atualizar usuário'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <DialogHeader><DialogTitle>Editar {user.email}</DialogTitle></DialogHeader>
      <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
      <div><Label>Perfil</Label><RoleSelect value={role} roles={roles} onChange={setRole} disabled={isSelf} /></div>
      <div>
        <Label>Situação</Label>
        <Select value={status} onValueChange={v => setStatus(v as UserAccount['status'])} disabled={isSelf}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="DISABLED">Desativado (não consegue entrar)</SelectItem>
          </SelectContent>
        </Select>
        {isSelf && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Você não pode alterar o seu próprio perfil ou situação.
          </p>
        )}
      </div>
      <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
    </form>
  );
}

function ResetPasswordForm({ user, onDone }: { user: UserAccount; onDone: () => void }) {
  const [temporaryPassword, setTemporaryPassword] = useState(generatePassword);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await resetUserPassword(user.id, temporaryPassword);
      toast.success(`Senha redefinida. Senha temporária: ${temporaryPassword}`, { duration: 15000 });
      onDone();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erro ao redefinir senha'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <DialogHeader><DialogTitle>Redefinir senha de {user.name}</DialogTitle></DialogHeader>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {user.name} sairá de todos os dispositivos e terá de criar uma nova senha ao entrar com a temporária.
      </p>
      <div>
        <Label>Senha temporária</Label>
        <Input value={temporaryPassword} onChange={e => setTemporaryPassword(e.target.value)} minLength={8} required />
      </div>
      <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Redefinir senha'}</Button>
    </form>
  );
}
