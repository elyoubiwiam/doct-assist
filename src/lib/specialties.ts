import type { Lang } from "./i18n";

export type FieldType = "checkbox" | "text" | "number" | "select" | "textarea";
export type Field = {
  id: string;
  label: string;
  type: FieldType;
  unit?: string | null;
  options?: string[] | null;
  section?: string;
  source: "template" | "ai" | "custom";
};

type L = { en: string; fr: string };
type TField = { label: L; type: FieldType; unit?: string; options?: { en: string[]; fr: string[] } };
export type Specialty = { id: string; name: L; icon: string; fields: TField[] };

const yn = (en: string, fr: string, type: FieldType = "checkbox"): TField => ({ label: { en, fr }, type });
const num = (en: string, fr: string, unit: string): TField => ({ label: { en, fr }, type: "number", unit });
const txt = (en: string, fr: string): TField => ({ label: { en, fr }, type: "text" });
const area = (en: string, fr: string): TField => ({ label: { en, fr }, type: "textarea" });
const sel = (en: string, fr: string, oen: string[], ofr: string[]): TField => ({
  label: { en, fr },
  type: "select",
  options: { en: oen, fr: ofr },
});

const vitals: TField[] = [
  num("Temperature", "Température", "°C"),
  num("Heart rate", "Fréquence cardiaque", "bpm"),
  txt("Blood pressure (mmHg)", "Pression artérielle (mmHg)"),
  num("Oxygen saturation", "Saturation en oxygène", "%"),
];
const pain = sel("Pain score", "Échelle de douleur", ["0", "1 to 3", "4 to 6", "7 to 10"], ["0", "1 à 3", "4 à 6", "7 à 10"]);
const onset = sel(
  "Onset",
  "Début",
  ["Sudden", "Gradual", "Recurrent"],
  ["Brutal", "Progressif", "Récidivant"],
);

export const SPECIALTIES: Specialty[] = [
  { id: "gp", icon: "🩺", name: { en: "General practice", fr: "Médecine générale" }, fields: [...vitals, onset, area("Current medication", "Traitement en cours"), txt("Allergies", "Allergies")] },
  { id: "internal", icon: "🫀", name: { en: "Internal medicine", fr: "Médecine interne" }, fields: [...vitals, num("Weight", "Poids", "kg"), area("Past medical history", "Antécédents médicaux"), area("Current medication", "Traitement en cours")] },
  { id: "paeds", icon: "🧸", name: { en: "Paediatrics", fr: "Pédiatrie" }, fields: [num("Temperature", "Température", "°C"), num("Weight", "Poids", "kg"), yn("Vaccinations up to date", "Vaccinations à jour"), sel("Feeding", "Alimentation", ["Normal", "Reduced", "Refusing"], ["Normale", "Diminuée", "Refus"]), yn("Reduced wet nappies", "Diminution des couches mouillées")] },
  { id: "cardio", icon: "❤️", name: { en: "Cardiology", fr: "Cardiologie" }, fields: [...vitals, yn("Chest pain", "Douleur thoracique"), yn("Palpitations", "Palpitations"), yn("Ankle oedema", "Œdèmes des chevilles"), sel("NYHA class", "Classe NYHA", ["I", "II", "III", "IV"], ["I", "II", "III", "IV"])] },
  { id: "resp", icon: "🫁", name: { en: "Respiratory medicine", fr: "Pneumologie" }, fields: [num("Respiratory rate", "Fréquence respiratoire", "/min"), num("Oxygen saturation", "Saturation en oxygène", "%"), yn("Productive cough", "Toux productive"), yn("Wheeze", "Sifflements"), sel("Smoking status", "Statut tabagique", ["Never", "Former", "Current"], ["Jamais", "Ancien fumeur", "Fumeur actuel"])] },
  { id: "gastro", icon: "🩻", name: { en: "Gastroenterology", fr: "Gastro-entérologie" }, fields: [pain, yn("Nausea or vomiting", "Nausées ou vomissements"), sel("Bowel habit", "Transit", ["Normal", "Diarrhoea", "Constipation", "Alternating"], ["Normal", "Diarrhée", "Constipation", "Alternance"]), yn("Blood in stool", "Sang dans les selles"), yn("Weight loss", "Perte de poids")] },
  { id: "neuro", icon: "🧠", name: { en: "Neurology", fr: "Neurologie" }, fields: [onset, yn("Headache", "Céphalées"), yn("Focal weakness", "Déficit moteur focal"), yn("Visual disturbance", "Troubles visuels"), txt("Glasgow Coma Scale", "Score de Glasgow")] },
  { id: "derm", icon: "🧴", name: { en: "Dermatology", fr: "Dermatologie" }, fields: [txt("Lesion location", "Localisation de la lésion"), num("Lesion size", "Taille de la lésion", "mm"), yn("Itching", "Prurit"), sel("Duration", "Durée", ["Under 1 week", "1 to 4 weeks", "Over 1 month"], ["Moins d'une semaine", "1 à 4 semaines", "Plus d'un mois"])] },
  { id: "ent", icon: "👂", name: { en: "Ear, nose and throat (ENT)", fr: "ORL" }, fields: [num("Temperature", "Température", "°C"), yn("Sore throat", "Mal de gorge"), yn("Ear pain", "Otalgie"), yn("Hearing loss", "Baisse de l'audition"), yn("Nasal congestion", "Congestion nasale")] },
  { id: "ophth", icon: "👁️", name: { en: "Ophthalmology", fr: "Ophtalmologie" }, fields: [txt("Visual acuity, right eye", "Acuité visuelle, œil droit"), txt("Visual acuity, left eye", "Acuité visuelle, œil gauche"), yn("Red eye", "Œil rouge"), yn("Eye pain", "Douleur oculaire"), yn("Contact lens wearer", "Porteur de lentilles")] },
  { id: "obgyn", icon: "🤰", name: { en: "Obstetrics and gynaecology", fr: "Gynécologie-obstétrique" }, fields: [txt("Last menstrual period", "Date des dernières règles"), yn("Possibility of pregnancy", "Grossesse possible"), { label: { en: "Gestational age (weeks)", fr: "Âge gestationnel (SA)" }, type: "number" }, yn("Vaginal bleeding", "Saignement vaginal"), pain] },
  { id: "uro", icon: "💧", name: { en: "Urology", fr: "Urologie" }, fields: [yn("Dysuria", "Dysurie"), yn("Haematuria", "Hématurie"), yn("Urinary frequency", "Pollakiurie"), txt("Urine dipstick result", "Résultat de la bandelette urinaire")] },
  { id: "endo", icon: "⚗️", name: { en: "Endocrinology", fr: "Endocrinologie" }, fields: [num("Weight", "Poids", "kg"), num("Capillary blood glucose", "Glycémie capillaire", "mmol/L"), num("Last HbA1c", "Dernière HbA1c", "mmol/mol"), yn("Polyuria or polydipsia", "Polyurie ou polydipsie")] },
  { id: "rheum", icon: "🦴", name: { en: "Rheumatology", fr: "Rhumatologie" }, fields: [txt("Joints affected", "Articulations atteintes"), num("Morning stiffness duration", "Durée de la raideur matinale", "min"), yn("Joint swelling", "Gonflement articulaire"), pain] },
  { id: "ortho", icon: "🦵", name: { en: "Trauma and orthopaedics", fr: "Orthopédie et traumatologie" }, fields: [txt("Mechanism of injury", "Mécanisme du traumatisme"), txt("Site of injury", "Siège de la lésion"), pain, yn("Able to bear weight", "Appui possible"), yn("Neurovascular status intact", "État neurovasculaire normal")] },
  { id: "psych", icon: "🧩", name: { en: "Psychiatry", fr: "Psychiatrie" }, fields: [sel("Mood", "Humeur", ["Euthymic", "Low", "Elevated", "Irritable"], ["Euthymique", "Basse", "Élevée", "Irritable"]), sel("Sleep", "Sommeil", ["Normal", "Reduced", "Increased"], ["Normal", "Diminué", "Augmenté"]), yn("Thoughts of self-harm", "Idées d'automutilation"), yn("Substance use", "Consommation de substances")] },
  { id: "infect", icon: "🦠", name: { en: "Infectious diseases", fr: "Maladies infectieuses" }, fields: [...vitals, txt("Recent travel", "Voyage récent"), yn("Contact with unwell people", "Contact avec des personnes malades"), yn("Immunocompromised", "Immunodépression")] },
  { id: "geri", icon: "🧓", name: { en: "Geriatric medicine", fr: "Gériatrie" }, fields: [...vitals, yn("Recent falls", "Chutes récentes"), yn("New confusion", "Confusion récente"), sel("Mobility", "Mobilité", ["Independent", "With aid", "Bed-bound"], ["Autonome", "Avec aide", "Alité"]), area("Current medication", "Traitement en cours")] },
  { id: "emerg", icon: "🚑", name: { en: "Emergency medicine", fr: "Médecine d'urgence" }, fields: [...vitals, num("Respiratory rate", "Fréquence respiratoire", "/min"), sel("AVPU", "AVPU", ["Alert", "Voice", "Pain", "Unresponsive"], ["Alerte", "Voix", "Douleur", "Aréactif"]), pain] },
  { id: "sport", icon: "🏃", name: { en: "Sport and exercise medicine", fr: "Médecine du sport" }, fields: [txt("Sport and level", "Sport et niveau"), txt("Mechanism of injury", "Mécanisme du traumatisme"), pain, yn("Previous injury at same site", "Antécédent de blessure au même endroit")] },
];

export const specialtyName = (id: string, lang: Lang) =>
  SPECIALTIES.find((s) => s.id === id)?.name[lang] ?? id;

const tplKey = (id: string, lang: Lang) => `anamnesis.template.${id}.${lang}`;
let counter = 0;
export const uid = () => `f${Date.now().toString(36)}${(counter++).toString(36)}`;

export function defaultTemplate(id: string, lang: Lang): Field[] {
  const s = SPECIALTIES.find((x) => x.id === id);
  if (!s) return [];
  return s.fields.map((f) => ({
    id: uid(),
    label: f.label[lang],
    type: f.type,
    unit: f.unit ?? null,
    options: f.options ? f.options[lang] : null,
    source: "template",
  }));
}

export function loadTemplate(id: string, lang: Lang): Field[] {
  try {
    const raw = localStorage.getItem(tplKey(id, lang));
    if (raw) return (JSON.parse(raw) as Field[]).map((f) => ({ ...f, id: uid(), source: "template" }));
  } catch {
    /* ignore */
  }
  return defaultTemplate(id, lang);
}

export function saveTemplate(id: string, lang: Lang, fields: Field[]) {
  const clean = fields.map(({ label, type, unit, options }) => ({ label, type, unit, options }));
  localStorage.setItem(tplKey(id, lang), JSON.stringify(clean));
}

export function resetTemplate(id: string, lang: Lang) {
  localStorage.removeItem(tplKey(id, lang));
}
