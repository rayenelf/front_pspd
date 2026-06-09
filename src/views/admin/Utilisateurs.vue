<script setup lang="ts">
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Input from "@/components/ui/Input.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";

const users = [
  { id: "U-9012", name: "Salma Bennani", email: "salma@…", role: "Client", joined: "12/01/26", status: "Actif" },
  { id: "U-9011", name: "Karim B.", email: "karim@…", role: "Prestataire", joined: "10/01/26", status: "Actif" },
  { id: "U-9008", name: "Imane R.", email: "imane@…", role: "Client", joined: "08/01/26", status: "Actif" },
  { id: "U-9001", name: "Hicham K.", email: "hicham@…", role: "Prestataire", joined: "02/01/26", status: "Suspendu" },
  { id: "U-8998", name: "Tarek O.", email: "tarek@…", role: "Client", joined: "28/12/25", status: "Actif" },
];
</script>

<template>
  <PanelCard title="Utilisateurs">
    <template #action>
      <Input placeholder="Rechercher…" class="w-56" />
    </template>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-xs uppercase text-muted-foreground">
          <tr><th class="py-2">ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit</th><th>Statut</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-t border-border">
            <td class="py-3 font-mono text-xs">{{ u.id }}</td>
            <td class="font-medium">{{ u.name }}</td>
            <td class="text-muted-foreground">{{ u.email }}</td>
            <td><Badge variant="secondary">{{ u.role }}</Badge></td>
            <td class="text-muted-foreground">{{ u.joined }}</td>
            <td><Badge :variant="u.status === 'Actif' ? 'default' : 'destructive'">{{ u.status }}</Badge></td>
            <td class="text-right"><Button variant="ghost" size="sm">Gérer</Button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelCard>
</template>
