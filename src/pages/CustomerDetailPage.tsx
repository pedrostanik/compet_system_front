import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCustomer, addPet, removePet, updatePet } from '@/api/customerApi';
import type { Customer, Pet, PetRequest } from '@/types/index.ts';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PetForm from '@/components/customer/PetForm';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const [editPetOpen, setEditPetOpen] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      const data = await getCustomer(Number(id));
      setCustomer(data);
    } catch {
      toast.error('Cliente não encontrado');
      navigate('/customers');
    }
  }

  async function handleAddPet(data: PetRequest) {
    try {
      await addPet(Number(id), data);
      toast.success('Pet adicionado');
      setOpen(false);
      load();
    } catch {
      toast.error('Erro ao adicionar pet');
    }
  }

  async function handleEditPet(data: PetRequest) {
    if (!petToEdit) return;
    try {
      await updatePet(Number(id), petToEdit.id, data);
      toast.success('Pet atualizado');
      setEditPetOpen(false);
      setPetToEdit(null);
      load();
    } catch {
      toast.error('Erro ao atualizar pet');
    }
  }

  async function handleRemovePet(petId: number) {
    try {
      await removePet(Number(id), petId);
      toast.success('Pet removido');
      load();
    } catch {
      toast.error('Erro ao remover pet');
    }
  }

  if (!customer) return <p>Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/customers')}>← Voltar</Button>
        <h2 className="text-xl font-semibold">{customer.name}</h2>
      </div>

      <div className="bg-white rounded-lg border p-4 flex flex-col gap-1 text-sm">
        <p><span className="text-gray-500">Email:</span> {customer.email}</p>
        <p><span className="text-gray-500">Telefone:</span> {customer.phone}</p>
        <p><span className="text-gray-500">CPF:</span> {customer.cpf}</p>
        <p><span className="text-gray-500">Endereço:</span> {customer.address}</p>
        <p><span className="text-gray-500">Observações:</span> {customer.obs}</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Pets</h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Adicionar pet</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar pet</DialogTitle>
              </DialogHeader>
              <PetForm onSubmit={handleAddPet} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Espécie</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Pelagem</TableHead>
                <TableHead>Pacote</TableHead>
                <TableHead>Vacinas</TableHead>
                <TableHead>Infos Adicionais</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.pets.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>{p.species}</TableCell>
                  <TableCell>{p.race}</TableCell>
                  <TableCell>{p.weight ? `${p.weight}kg` : '-'}</TableCell>
                  <TableCell>{p.coatType || '-'}</TableCell>
                  <TableCell>
                    {p.packId ? (
                      <span
                        className="text-xs bg-green-100 text-green-800 rounded px-2 py-0.5"
                        title={p.packagePrice ? `R$ ${Number(p.packagePrice).toFixed(2)}` : undefined}
                      >
                        Pacote
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 text-lg">
                      {p.rabieVaccination && <span title="Antirrábica" className="cursor-help">💉R</span>}
                      {p.v10Vaccination && <span title="V10" className="cursor-help">💉V10</span>}
                      {p.dewormed && <span title="Vermifugado" className="cursor-help">🐛</span>}
                      {!p.rabieVaccination && !p.v10Vaccination && !p.dewormed && <span className="text-gray-300">-</span>}
                    </div>
                  </TableCell>

                  <TableCell>
                            <div className="flex flex-col gap-1 text-xs max-w-[200px]">
                              {p.allergy && (
                                <p><span className="font-bold text-red-600">Alergia:</span> {p.allergy}</p>
                              )}
                              {p.healthIssues && (
                                <p><span className="font-bold text-orange-600">Saúde:</span> {p.healthIssues}</p>
                              )}
                              {p.observations && (
                                <p><span className="font-bold text-gray-600">Obs:</span> {p.observations}</p>
                              )}
                              {/* Se tudo for vazio, mostra o traço clássico */}
                              {!p.allergy && !p.healthIssues && !p.observations && <span className="text-gray-300">-</span>}
                            </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPetToEdit(p);
                          setEditPetOpen(true);
                        }}
                      >
                        Editar
                      </Button>

                      {/* Pop-up de Confirmação para Deletar Pet */}
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button variant="destructive" size="sm">Remover</Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   Esta ação não pode ser desfeita. Isso excluirá permanentemente o pet
                                   <strong> {p.name}</strong> do nosso sistema.
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                 <AlertDialogAction
                                   onClick={() => handleRemovePet(p.id)}
                                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                 >
                                   Confirmar Exclusão
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editPetOpen} onOpenChange={setEditPetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar pet</DialogTitle>
          </DialogHeader>
          {/* Usando o spread ...petToEdit para garantir que TODOS os campos cheguem ao form */}
          <PetForm
            onSubmit={handleEditPet}
            initial={petToEdit ?? undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
