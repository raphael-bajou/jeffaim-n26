// Le contenu est édité par le propriétaire via Pages CMS (voir .pages.yml)
// et stocké en JSON dans /content. Ce fichier le lit au moment du build.
import pizzasFile from "../../content/pizzas.json";
import emplacementsFile from "../../content/emplacements.json";
import reglagesFile from "../../content/reglages.json";

export type Pizza = {
  nom: string;
  prix: number;
  base: string;
  ingredients: string[];
  infos?: string;
  image?: string;
  image_illustrative?: boolean;
  pizza_du_mois?: boolean;
  visible?: boolean;
};

export type Emplacement = { jour: string; lieu: string; infos?: string };

export const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

const visibles = (pizzasFile as Pizza[]).filter((p) => p.visible !== false);

export const pizzaDuMois = visibles.find((p) => p.pizza_du_mois);
// La pizza perso est affichée à part, en fin de carte
export const carte = visibles.filter((p) => p.base !== "au choix");
export const pizzasPerso = visibles.filter((p) => p.base === "au choix");

export const emplacements = (emplacementsFile as Emplacement[])
  .filter((e) => e.lieu)
  .sort((a, b) => ((JOURS.indexOf(a.jour) + 6) % 7) - ((JOURS.indexOf(b.jour) + 6) % 7));

export const reglages = reglagesFile;

export const prix = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }) + " €";

export const telHref = (tel: string) => "tel:" + tel.replace(/[^\d+]/g, "");

// Ingrédients filtrables (hors pizza perso), triés
export const ingredients = [
  ...new Set(visibles.filter((p) => p.base !== "au choix").flatMap((p) => p.ingredients)),
].sort((a, b) => a.localeCompare(b, "fr"));
export const bases = [...new Set(visibles.map((p) => p.base).filter((b) => b && b !== "au choix"))];
