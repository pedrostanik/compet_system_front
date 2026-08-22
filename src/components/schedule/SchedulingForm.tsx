    import { useState, useEffect } from 'react';
    import type { SchedulingRequest } from '@/api/schedulingApi';
    import { getCustomers } from '@/api/customerApi';
    import { getProtocols } from '@/api/protocolApi';
    import { getPacks } from '@/api/packApi';
    import type { Customer, Protocol, Pack, Pet } from '@/types/index.ts';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Button } from '@/components/ui/button';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
    } from '@/components/ui/alert-dialog';
    import { useSubmitGuard } from '@/hooks/useSubmitGuard';

    interface Props {
      onSubmit: (data: SchedulingRequest, activePackId?: number) => void;
      // packCycle não faz parte do SchedulingRequest (é calculado pelo backend),
      // mas pode vir no initial ao editar um agendamento já existente, só para exibição.
      initial?: Partial<SchedulingRequest> & { packCycle?: number };
    }

    export default function SchedulingForm({ onSubmit, initial }: Props) {
      const [customers, setCustomers] = useState<Customer[]>([]);
      const [protocols, setProtocols] = useState<Protocol[]>([]);
      const [packs, setPacks] = useState<Pack[]>([]);
      const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
      const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

      // Pacote vigente do pet selecionado (null = não tem pacote)
      const [activePack, setActivePack] = useState<Pack | null>(null);
      const [confirmOpen, setConfirmOpen] = useState(false);
      const [basePrice, setBasePrice] = useState<number>(initial?.price ?? 0);

      const [form, setForm] = useState<SchedulingRequest>({
        customerId: initial?.customerId ?? 0,
        customerName: initial?.customerName ?? '',
        petId: initial?.petId ?? 0,
        petName: initial?.petName ?? '',
        schedulingObservations: initial?.schedulingObservations ?? '',
        time: initial?.time ?? '',
        isPackage: initial?.isPackage ?? false,
        protocolIds: initial?.protocolIds ?? [],
        duration: initial?.duration ?? 60,
        price: initial?.price ?? 60,
      });

      const [guardedSubmit, isSubmitting] = useSubmitGuard(
        async (data: SchedulingRequest, activePackId?: number) => {
          await onSubmit(data, activePackId);
        }
      );
      useEffect(() => {
        getCustomers().then(setCustomers);
        getProtocols().then(setProtocols);
        getPacks().then(setPacks).catch(() => {});
      }, []);

      useEffect(() => {
        if (initial?.customerId && customers.length > 0) {
          const customer = customers.find(c => c.id === initial.customerId);
          if (customer) {
            setSelectedCustomer(customer);
            setForm((f: SchedulingRequest) => ({
              ...f,
              customerId: customer.id,
              customerName: customer.name,
              petId: initial.petId ?? 0,
              petName: initial.petName ?? ''
            }));
          }
        }
      }, [initial?.customerId, customers]);

        useEffect(() => {
          if (!selectedCustomer || !form.petId) {
            setActivePack(null);
            return;
          }

          const pet = selectedCustomer.pets.find(p => p.id === form.petId);

          if (pet?.packId) {
            const pack = packs.find(p => p.id === pet.packId) ?? null;
            setActivePack(pack);

            const packProtocolIds = pack ? pack.protocols.map(p => p.protocolId) : [];

            // Calcula o preço base do ciclo dividindo pelo número de sessões
            const totalPrice = pet.packagePrice ?? 0;
            const divisor = pack?.frequencia === 'Semanal' ? 4
                          : pack?.frequencia === 'Quinzenal' ? 2
                          : 1;
            const cyclePrice = totalPrice / divisor;

            setBasePrice(cyclePrice);
            setForm(f => ({
              ...f,
              isPackage: true,
              protocolIds: packProtocolIds,
              price: cyclePrice,
            }));
          } else {
            setActivePack(null);
            setBasePrice(0);
            setForm(f => ({
              ...f,
              isPackage: false,
              price: initial?.price ?? f.price, // ← mantém o preço existente
            }));
          }
        }, [selectedCustomer, form.petId, packs]);

      function handleCustomerChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const customer = customers.find(c => c.id === Number(e.target.value));
        if (customer) {
          setSelectedCustomer(customer);
          setForm(f => ({ ...f, customerId: customer.id, customerName: customer.name, petId: 0, petName: '' }));
        }
      }

      function handlePetChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const pet = selectedCustomer?.pets.find(p => p.id === Number(e.target.value));
        if (pet) {
            setSelectedPet(pet);
          setForm((f: SchedulingRequest) => ({ ...f, petId: pet.id, petName: pet.name }));
        }
      }

      function handleProtocolToggle(protocolId: number) {
        setForm((f: SchedulingRequest) => ({
          ...f,
          protocolIds: f.protocolIds.includes(protocolId)
            ? f.protocolIds.filter(id => id !== protocolId)
            : [...f.protocolIds, protocolId],
        }));
      }

      function handle(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
      }

      // Envolvido em um elemento <form> para disparar a validação nativa do HTML5
        function handleFormSubmit(e: React.FormEvent) {
          e.preventDefault();
          if (activePack) {
            setConfirmOpen(true);
            return;
          }
          guardedSubmit(form, undefined);
        }

      function handleConfirmSingle() {
        setConfirmOpen(false);
        guardedSubmit(form, undefined); // agendamento avulso, não entra no ciclo do pacote
      }

      function handleConfirmPackage() {
        setConfirmOpen(false);
        guardedSubmit(form, activePack?.id); // entra no ciclo, backend cria os próximos
      }

      return (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">          <div>
                  <Label>Cliente</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    onChange={handleCustomerChange}
                    value={form.customerId || ''}
                    required
                  >
                    <option value="" disabled>Selecione um cliente</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {selectedCustomer && selectedCustomer.obs && (
                  <div className="border border-yellow-200 bg-yellow-50 rounded-md px-3 py-2">
                    <p className="text-xs font-medium text-yellow-800 mb-0.5">Observações do cliente</p>
                    <p className="text-sm text-yellow-700">{selectedCustomer.obs}</p>
                  </div>
                )}

          {selectedCustomer && (
            <div>
              <Label>Pet</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                onChange={handlePetChange}
                value={form.petId || ''}
                required
              >
                <option value="" disabled>Selecione um pet</option>
                {selectedCustomer.pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

            {selectedPet && selectedPet.healthIssues && selectedPet.healthIssues !== 'Não' && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-md px-3 py-2">
                <p className="text-xs font-medium text-yellow-800 mb-0.5">Saúde</p>
                <p className="text-sm text-yellow-700">{selectedPet.healthIssues}</p>
                </div>
                )}
            {selectedPet && selectedPet.allergy && selectedPet.allergy !== 'Não' && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-md px-3 py-2">
                <p className="text-xs font-medium text-yellow-800 mb-0.5">Alergias</p>
                <p className="text-sm text-yellow-700">{selectedPet.allergy}</p>
                </div>
                )}
              {selectedPet && selectedPet.observations && (
                  <div className="border border-yellow-200 bg-yellow-50 rounded-md px-3 py-2">
                  <p className="text-xs font-medium text-yellow-800 mb-0.5">Observações do Pet</p>
                  <p className="text-sm text-yellow-700">{selectedPet.observations}</p>
                  </div>
              )}

          {/* Card de pacote vigente */}
          {activePack && (
            <div className="border border-green-200 bg-green-50 rounded-md p-3 flex flex-col gap-1">
              <p className="text-sm font-medium text-green-800">
                Pacote vigente: {activePack.name}
              </p>
              <p className="text-xs text-green-700">
                {activePack.frequencia} · {activePack.protocols.map(pp => `${pp.protocolName} x${pp.quantity}`).join(', ')}
              </p>
              <p className="text-xs text-green-700">
                Este agendamento fará parte do pacote — os próximos agendamentos serão criados automaticamente.
              </p>
            </div>
          )}

          {/* Só aparece ao editar um agendamento que já existe e faz parte de um pacote */}
          {form.isPackage && initial?.packCycle != null && (
            <div>
              <Label>Ciclo do pacote</Label>
              <Input value={initial.packCycle} disabled readOnly />
            </div>
          )}

          <div>
            <Label>Data e hora</Label>
            <Input
              name="time"
              type="datetime-local"
              value={form.time}
              onChange={handle}
              required
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Input
              name="schedulingObservations"
              value={form.schedulingObservations}
              onChange={handle}
            />
          </div>

          <div>
            <Label>Duração (minutos)</Label>
            <Input
              name="duration"
              type="number"
              min={1}
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
              required
            />
          </div>

          {protocols.length > 0 && (
            <div>
              <Label>Serviços</Label>
              <div className="flex flex-col gap-2 mt-1 border rounded-md p-3">
                {protocols.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`protocol-${p.id}`}
                      checked={form.protocolIds.includes(p.id)}
                      onChange={() => handleProtocolToggle(p.id)}
                    />
                    <label htmlFor={`protocol-${p.id}`} className="text-sm cursor-pointer">
                      {p.name}
                      {p.price && (
                        <span className="text-gray-400 ml-2">
                          R$ {Number(p.price).toFixed(2)}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPackage"
              checked={form.isPackage}
              disabled={!!activePack}
              onChange={e => setForm(f => ({ ...f, isPackage: e.target.checked }))}
            />
            <Label htmlFor="isPackage">
              Pacote
              {activePack && (
                <span className="text-xs text-muted-foreground ml-2">
                  (definido automaticamente pelo pacote vigente)
                </span>
              )}
            </Label>
          </div>

            {activePack && (
              <div className="flex flex-col gap-2">
                <div>
                  <Label>Valor do pacote</Label>
                  <Input
                    value={(() => {
                      const pet = selectedCustomer?.pets.find(p => p.id === form.petId);
                      return pet?.packagePrice
                        ? `R$ ${Number(pet.packagePrice).toFixed(2)}`
                        : 'Não informado';
                    })()}
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <Label>Preço adicional (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0,00"
                    value={form.price - basePrice > 0 ? form.price - basePrice : ''}
                    onChange={e => {
                      const extra = Number(e.target.value) || 0;
                      setForm(f => ({ ...f, price: basePrice + extra }));
                    }}
                  />
                </div>
                {form.price > basePrice && (
                  <p className="text-xs text-muted-foreground">
                    Total da sessão: R$ {Number(form.price).toFixed(2)}
                  </p>
                )}
              </div>
            )}

                 <div>
                   <Label>Preço (R$)</Label>
                   <Input
                         name="price"
                         type="number"
                         min={0}
                         value={form.price}
                         disabled={!!activePack}
                         readOnly={!!activePack}
                         onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                   />

                 </div>


              <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
               <AlertDialogContent>
                 <AlertDialogHeader>
                   <AlertDialogTitle>Agendamento de pacote</AlertDialogTitle>
                   <AlertDialogDescription>
                     Este pet possui o pacote <strong>{activePack?.name}</strong> ({activePack?.frequencia}).
                     Você pode aplicar esta alteração apenas a este agendamento, ou a todo o ciclo
                     do pacote (o que criará os próximos agendamentos automaticamente).
                   </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                   <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                   <Button variant="outline" onClick={handleConfirmSingle} disabled={isSubmitting}>
                     {isSubmitting ? 'Salvando...' : 'Somente este agendamento'}
                   </Button>
                   <AlertDialogAction onClick={handleConfirmPackage} disabled={isSubmitting}>
                     {isSubmitting ? 'Salvando...' : 'Aplicar ao pacote'}
                   </AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
           </form>
         );
       }
