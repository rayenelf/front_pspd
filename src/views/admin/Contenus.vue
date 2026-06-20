<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { api, type CategorieData, type ServiceData, type ApiError } from "@/lib/api";

// ── État ─────────────────────────────────────────────────────────────────────
const categories = ref<CategorieData[]>([]);
const selectedId  = ref<string | null>(null);
const services    = ref<ServiceData[]>([]);
const loading     = ref(false);
const feedback    = ref<{ type: "success" | "error"; text: string } | null>(null);

/** Aplatit l'arbre en liste avec niveau d'indentation et parent (pour les <select>). */
const flatCategories = computed(() => {
  const out: { id: string; libelle: string; slug: string; depth: number; parentId: string | null }[] = [];
  const walk = (nodes: CategorieData[], depth: number, parentId: string | null) => {
    for (const n of nodes) {
      out.push({ id: n.id, libelle: n.libelle, slug: n.slug, depth, parentId });
      if (n.enfants?.length) walk(n.enfants, depth + 1, n.id);
    }
  };
  walk(categories.value, 0, null);
  return out;
});

const selectedLibelle = computed(
  () => flatCategories.value.find((c) => c.id === selectedId.value)?.libelle ?? "",
);

function notify(type: "success" | "error", text: string) {
  feedback.value = { type, text };
  setTimeout(() => (feedback.value = null), 4000);
}

// ── Chargement ───────────────────────────────────────────────────────────────
async function loadCategories() {
  loading.value = true;
  try {
    categories.value = await api.getCategories();
  } catch (e) {
    notify("error", (e as ApiError).message || "Échec du chargement des catégories.");
  } finally {
    loading.value = false;
  }
}

async function selectCategory(id: string) {
  selectedId.value = id;
  services.value = [];
  try {
    services.value = await api.getCategoryServices(id);
  } catch (e) {
    notify("error", (e as ApiError).message || "Échec du chargement des services.");
  }
}

onMounted(loadCategories);

// ── Création / édition catégorie ───────────────────────────────────────────────
const catForm = reactive({ libelle: "", slug: "", parentId: "" });
const catSaving = ref(false);
const editingCatId = ref<string | null>(null);
const isEditingCat = computed(() => editingCatId.value !== null);

/** Ids à exclure du choix de parent en édition : la catégorie et tous ses descendants (anti-cycle). */
const excludedParentIds = computed(() => {
  const ids = new Set<string>();
  if (!editingCatId.value) return ids;
  ids.add(editingCatId.value);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of flatCategories.value) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) { ids.add(c.id); changed = true; }
    }
  }
  return ids;
});
const parentOptions = computed(() =>
  flatCategories.value.filter((c) => !excludedParentIds.value.has(c.id)),
);

/** Génère un slug à partir du libellé (minuscules, sans accents, tirets). */
function autoSlug() {
  if (catForm.slug) return;
  catForm.slug = catForm.libelle
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resetCatForm() {
  editingCatId.value = null;
  catForm.libelle = ""; catForm.slug = ""; catForm.parentId = "";
}

/** Charge la catégorie sélectionnée dans le formulaire en mode édition. */
function startEditCategory(id: string) {
  const c = flatCategories.value.find((x) => x.id === id);
  if (!c) return;
  editingCatId.value = id;
  catForm.libelle = c.libelle;
  catForm.slug = c.slug;
  catForm.parentId = c.parentId ?? "";
}

async function saveCategory() {
  if (!catForm.libelle || !catForm.slug) {
    notify("error", "Libellé et slug requis.");
    return;
  }
  catSaving.value = true;
  try {
    if (editingCatId.value) {
      await api.updateCategory(editingCatId.value, {
        libelle: catForm.libelle,
        slug: catForm.slug,
        parentId: catForm.parentId || null,
      });
      notify("success", "Catégorie mise à jour.");
    } else {
      await api.createCategory(catForm.libelle, catForm.slug, catForm.parentId || undefined);
      notify("success", "Catégorie créée.");
    }
    resetCatForm();
    await loadCategories();
  } catch (e) {
    notify("error", (e as ApiError).message || "Échec de l'enregistrement.");
  } finally {
    catSaving.value = false;
  }
}

async function deactivateCategory(id: string) {
  if (!confirm("Désactiver cette catégorie ? Elle sera retirée du catalogue.")) return;
  try {
    await api.deleteCategory(id);
    if (selectedId.value === id) { selectedId.value = null; services.value = []; }
    if (editingCatId.value === id) resetCatForm();
    await loadCategories();
    notify("success", "Catégorie désactivée.");
  } catch (e) {
    notify("error", (e as ApiError).message || "Échec de la désactivation.");
  }
}

// ── Création service ─────────────────────────────────────────────────────────
const svcForm = reactive({ libelle: "", description: "", prixIndicatif: "", unite: "" });
const svcSaving = ref(false);

async function createService() {
  if (!selectedId.value) { notify("error", "Sélectionnez d'abord une catégorie."); return; }
  if (!svcForm.libelle) { notify("error", "Libellé du service requis."); return; }
  svcSaving.value = true;
  try {
    await api.createService({
      categorieId:   selectedId.value,
      libelle:       svcForm.libelle,
      description:   svcForm.description || undefined,
      prixIndicatif: svcForm.prixIndicatif ? Number(svcForm.prixIndicatif) : undefined,
      unite:         svcForm.unite || undefined,
    });
    svcForm.libelle = ""; svcForm.description = ""; svcForm.prixIndicatif = ""; svcForm.unite = "";
    await selectCategory(selectedId.value);
    notify("success", "Service créé.");
  } catch (e) {
    notify("error", (e as ApiError).message || "Échec de la création.");
  } finally {
    svcSaving.value = false;
  }
}

async function deleteService(id: string) {
  try {
    await api.deleteService(id);
    if (selectedId.value) await selectCategory(selectedId.value);
    notify("success", "Service désactivé.");
  } catch (e) {
    notify("error", (e as ApiError).message || "Échec de la désactivation.");
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Feedback global -->
    <p v-if="feedback" :class="[
      'rounded-md px-3 py-2 text-sm font-medium',
      feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    ]">{{ feedback.text }}</p>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- ── Catégories ───────────────────────────────────────────────── -->
      <PanelCard title="Catégories de services">
        <p v-if="loading" class="text-sm text-muted-foreground">Chargement…</p>
        <p v-else-if="!flatCategories.length" class="text-sm text-muted-foreground">
          Aucune catégorie. Créez-en une ci-dessous.
        </p>
        <div v-else class="flex flex-wrap gap-2">
          <button
            v-for="c in flatCategories"
            :key="c.id"
            type="button"
            @click="selectCategory(c.id)"
          >
            <Badge
              :variant="selectedId === c.id ? 'default' : 'secondary'"
              class="cursor-pointer px-3 py-1.5"
              :style="{ marginLeft: `${c.depth * 12}px` }"
            >{{ c.libelle }}</Badge>
          </button>
        </div>

        <!-- Actions sur la catégorie sélectionnée -->
        <div v-if="selectedId" class="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span class="text-muted-foreground">
            Sélection : <span class="font-medium text-foreground">{{ selectedLibelle }}</span>
          </span>
          <Button size="sm" variant="outline" @click="startEditCategory(selectedId)">Modifier</Button>
          <Button size="sm" variant="outline" @click="deactivateCategory(selectedId)">Désactiver</Button>
        </div>

        <!-- Formulaire création / édition de catégorie -->
        <div class="mt-5 space-y-3 border-t border-border pt-4">
          <p class="text-sm font-medium">
            {{ isEditingCat ? "Modifier la catégorie" : "Nouvelle catégorie" }}
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-2">
              <Label>Libellé</Label>
              <Input v-model="catForm.libelle" placeholder="Ex: Plomberie" @blur="autoSlug" />
            </div>
            <div class="space-y-2">
              <Label>Slug</Label>
              <Input v-model="catForm.slug" placeholder="plomberie" />
            </div>
            <div class="space-y-2 sm:col-span-2">
              <Label>Catégorie parente (optionnel)</Label>
              <select
                v-model="catForm.parentId"
                class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <option value="">— Racine —</option>
                <option v-for="c in parentOptions" :key="c.id" :value="c.id">
                  {{ "—".repeat(c.depth) }} {{ c.libelle }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              class="bg-gradient-warm text-primary-foreground"
              :disabled="catSaving"
              @click="saveCategory"
            >{{ catSaving ? "Enregistrement…" : isEditingCat ? "Enregistrer" : "+ Ajouter la catégorie" }}</Button>
            <Button v-if="isEditingCat" variant="outline" :disabled="catSaving" @click="resetCatForm">
              Annuler
            </Button>
          </div>
        </div>
      </PanelCard>

      <!-- ── Services de la catégorie sélectionnée ────────────────────── -->
      <PanelCard :title="selectedId ? `Services — ${selectedLibelle}` : 'Services'">
        <p v-if="!selectedId" class="text-sm text-muted-foreground">
          Sélectionnez une catégorie à gauche pour voir et gérer ses services.
        </p>
        <template v-else>
          <ul v-if="services.length" class="space-y-2">
            <li
              v-for="s in services"
              :key="s.id"
              class="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <p class="text-sm font-medium">{{ s.libelle }}</p>
                <p class="text-xs text-muted-foreground">
                  <span v-if="s.prixIndicatif">dès {{ s.prixIndicatif }} TND</span>
                  <span v-if="s.unite"> · {{ s.unite }}</span>
                </p>
              </div>
              <Button size="sm" variant="outline" @click="deleteService(s.id)">Désactiver</Button>
            </li>
          </ul>
          <p v-else class="text-sm text-muted-foreground">Aucun service dans cette catégorie.</p>

          <!-- Formulaire nouveau service -->
          <div class="mt-4 space-y-3 border-t border-border pt-4">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="space-y-2 sm:col-span-2">
                <Label>Libellé du service</Label>
                <Input v-model="svcForm.libelle" placeholder="Ex: Réparation fuite" />
              </div>
              <div class="space-y-2">
                <Label>Prix indicatif (TND)</Label>
                <Input v-model="svcForm.prixIndicatif" type="number" min="0" placeholder="150" />
              </div>
              <div class="space-y-2">
                <Label>Unité</Label>
                <Input v-model="svcForm.unite" placeholder="intervention, heure…" />
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input v-model="svcForm.description" placeholder="Courte description" />
              </div>
            </div>
            <Button
              class="bg-gradient-warm text-primary-foreground"
              :disabled="svcSaving"
              @click="createService"
            >{{ svcSaving ? "Création…" : "+ Ajouter le service" }}</Button>
          </div>
        </template>
      </PanelCard>
    </div>
  </div>
</template>
