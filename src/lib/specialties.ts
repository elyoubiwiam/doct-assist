import type { Lang } from "./i18n";

export type FieldType = "checkbox" | "text" | "number" | "select" | "textarea";
/** Bilingual text. An empty side means "not yet translated". */
export type BL = { en: string; fr: string };

export type Field = {
  id: string;
  key?: string;
  label: BL;
  type: FieldType;
  unit: BL | null;
  options: BL[] | null;
  section: BL | null;
  source: "template" | "ai" | "custom";
};

export const L = (en: string, fr: string): BL => ({ en, fr });
export const tr = (b: BL | null | undefined, lang: Lang) => (b ? b[lang] || b[lang === "en" ? "fr" : "en"] : "");
export const isMissing = (b: BL | null | undefined) => !!b && (!b.en.trim() || !b.fr.trim()) && !!(b.en.trim() || b.fr.trim());
export const fromLang = (text: string, lang: Lang): BL => (lang === "en" ? { en: text, fr: "" } : { en: "", fr: text });

type TField = Omit<Field, "id" | "source">;
type Opt = [string, string];
const opts = (o: Opt[]) => o.map(([en, fr]) => L(en, fr));

// Sections
const S = {
  hpc: L("History of presenting complaint", "Histoire de la maladie"),
  vitals: L("Vital signs", "Constantes"),
  exam: L("Examination", "Examen clinique"),
  bg: L("Medical background", "Antécédents et traitements"),
  social: L("Social history", "Mode de vie"),
};

const cb = (key: string, section: BL, en: string, fr: string): TField => ({ key, section, label: L(en, fr), type: "checkbox", unit: null, options: null });
const tx = (key: string, section: BL, en: string, fr: string, unit?: BL): TField => ({ key, section, label: L(en, fr), type: "text", unit: unit ?? null, options: null });
const ta = (key: string, section: BL, en: string, fr: string): TField => ({ key, section, label: L(en, fr), type: "textarea", unit: null, options: null });
const nm = (key: string, section: BL, en: string, fr: string, unit: BL | null): TField => ({ key, section, label: L(en, fr), type: "number", unit, options: null });
const sl = (key: string, section: BL, en: string, fr: string, o: Opt[]): TField => ({ key, section, label: L(en, fr), type: "select", unit: null, options: opts(o) });

const U = {
  c: L("°C", "°C"),
  bpm: L("bpm", "batt/min"),
  mmHg: L("mmHg", "mmHg"),
  perMin: L("/min", "/min"),
  pct: L("%", "%"),
  kg: L("kg", "kg"),
  cm: L("cm", "cm"),
  mm: L("mm", "mm"),
  min: L("min", "min"),
  days: L("days", "jours"),
  py: L("pack-years", "paquets-années"),
  mmolL: L("mmol/L", "mmol/L"),
  mmolMol: L("mmol/mol", "mmol/mol"),
  lMin: L("L/min", "L/min"),
  weeks: L("weeks", "SA"),
};

// Shared blocks
const V = {
  temp: nm("temp", S.vitals, "Temperature", "Température", U.c),
  hr: nm("hr", S.vitals, "Heart rate", "Fréquence cardiaque", U.bpm),
  bp: tx("bp", S.vitals, "Blood pressure", "Pression artérielle", U.mmHg),
  rr: nm("rr", S.vitals, "Respiratory rate", "Fréquence respiratoire", U.perMin),
  spo2: nm("spo2", S.vitals, "Oxygen saturation", "Saturation en oxygène", U.pct),
  weight: nm("weight", S.vitals, "Weight", "Poids", U.kg),
  height: nm("height", S.vitals, "Height", "Taille", U.cm),
};
const allVitals = [V.temp, V.hr, V.bp, V.rr, V.spo2, V.weight, V.height];

const background: TField[] = [
  ta("allergies", S.bg, "Allergies and reactions", "Allergies et réactions"),
  ta("meds", S.bg, "Current medication", "Traitement en cours"),
  ta("pmh", S.bg, "Past medical and surgical history", "Antécédents médicaux et chirurgicaux"),
  ta("fhx", S.bg, "Family history", "Antécédents familiaux"),
];

const social: TField[] = [
  sl("smoking", S.social, "Smoking status", "Statut tabagique", [
    ["Never smoked", "Non-fumeur"],
    ["Ex-smoker", "Ancien fumeur"],
    ["Current smoker", "Fumeur actuel"],
    ["Vaping only", "Vapotage uniquement"],
  ]),
  nm("packyears", S.social, "Smoking history", "Consommation tabagique", U.py),
  sl("alcohol", S.social, "Alcohol use", "Consommation d'alcool", [
    ["None", "Aucune"],
    ["Occasional", "Occasionnelle"],
    ["Regular", "Régulière"],
    ["Heavy", "Excessive"],
  ]),
  tx("alcoholDetail", S.social, "Alcohol intake, type and quantity", "Consommation d'alcool, type et quantité"),
  sl("drugs", S.social, "Recreational drug use", "Consommation de drogues", [
    ["None", "Aucune"],
    ["Past", "Ancienne"],
    ["Current", "Actuelle"],
  ]),
  tx("occupation", S.social, "Occupation and exposures", "Profession et expositions"),
  sl("living", S.social, "Living situation", "Conditions de vie", [
    ["Lives alone", "Vit seul(e)"],
    ["Lives with family or partner", "Vit en famille ou en couple"],
    ["Residential care", "En établissement"],
    ["No fixed abode", "Sans domicile fixe"],
  ]),
];

const onset = sl("onset", S.hpc, "Onset", "Mode de début", [
  ["Sudden", "Brutal"],
  ["Gradual", "Progressif"],
  ["Recurrent", "Récidivant"],
]);
const duration = tx("duration", S.hpc, "Duration of symptoms", "Durée des symptômes");
const pain = sl("pain", S.hpc, "Pain score", "Intensité de la douleur", [
  ["0, no pain", "0, aucune douleur"],
  ["1 to 3, mild", "1 à 3, légère"],
  ["4 to 6, moderate", "4 à 6, modérée"],
  ["7 to 10, severe", "7 à 10, sévère"],
]);
const weightLoss = cb("weightLoss", S.hpc, "Unintentional weight loss", "Perte de poids involontaire");
const fatigue = cb("fatigue", S.hpc, "Fatigue", "Asthénie");
const fever = cb("fever", S.hpc, "Fever", "Fièvre");
const anticoag = cb("anticoag", S.bg, "Anticoagulant treatment", "Traitement anticoagulant");

export type Specialty = { id: string; name: BL; icon: string; fields: TField[] };

export const SPECIALTIES: Specialty[] = [
  {
    id: "gp", icon: "🩺", name: L("General practice", "Médecine générale"),
    fields: [onset, duration, pain, fever, fatigue, weightLoss,
      sl("appetite", S.hpc, "Appetite", "Appétit", [["Normal", "Normal"], ["Reduced", "Diminué"], ["Increased", "Augmenté"]]),
      sl("sleep", S.hpc, "Sleep", "Sommeil", [["Normal", "Normal"], ["Disturbed", "Perturbé"], ["Insomnia", "Insomnie"]]),
      ...allVitals, ...background, ...social,
      ta("exam", S.exam, "Examination findings", "Données de l'examen clinique")],
  },
  {
    id: "internal", icon: "🫀", name: L("Internal medicine", "Médecine interne"),
    fields: [onset, duration, fever, fatigue, weightLoss,
      cb("nightSweats", S.hpc, "Night sweats", "Sueurs nocturnes"),
      cb("nodes", S.exam, "Palpable lymph nodes", "Adénopathies palpables"),
      ta("ros", S.hpc, "Systems review", "Interrogatoire par appareil"),
      tx("vacc", S.bg, "Vaccination status", "Statut vaccinal"),
      ...allVitals, ...background, ...social,
      ta("exam", S.exam, "Examination findings", "Données de l'examen clinique")],
  },
  {
    id: "paeds", icon: "🧸", name: L("Paediatrics", "Pédiatrie"),
    fields: [onset, duration, V.temp, V.hr, V.rr, V.spo2, V.weight, V.height,
      nm("headCirc", S.vitals, "Head circumference", "Périmètre crânien", U.cm),
      sl("feeding", S.hpc, "Feeding", "Alimentation", [["Normal", "Normale"], ["Reduced", "Diminuée"], ["Refusing feeds", "Refus alimentaire"]]),
      cb("wetNappies", S.hpc, "Reduced wet nappies", "Diminution des couches mouillées"),
      sl("behaviour", S.exam, "Behaviour", "Comportement", [["Normal", "Normal"], ["Irritable", "Irritable"], ["Drowsy", "Somnolent"], ["Floppy", "Hypotonique"]]),
      cb("purpura", S.exam, "Non-blanching rash", "Éruption purpurique ne s'effaçant pas à la vitropression"),
      tx("birth", S.bg, "Birth history and gestation at birth", "Antécédents néonatals et terme de naissance"),
      cb("vacc", S.bg, "Vaccinations up to date", "Vaccinations à jour"),
      tx("development", S.bg, "Developmental milestones", "Acquisitions psychomotrices"),
      ...background,
      cb("nursery", S.social, "Attends nursery or school", "Fréquente la crèche ou l'école"),
      cb("passiveSmoke", S.social, "Exposure to second-hand smoke", "Exposition au tabagisme passif")],
  },
  {
    id: "cardio", icon: "❤️", name: L("Cardiology", "Cardiologie"),
    fields: [onset, duration,
      cb("chestPain", S.hpc, "Chest pain", "Douleur thoracique"),
      sl("painChar", S.hpc, "Character of chest pain", "Type de douleur thoracique", [["Pressure or tightness", "Constrictive"], ["Sharp", "En coup de poignard"], ["Burning", "À type de brûlure"], ["Tearing", "Déchirante"]]),
      cb("exertional", S.hpc, "Related to exertion", "Liée à l'effort"),
      cb("palpitations", S.hpc, "Palpitations", "Palpitations"),
      cb("syncope", S.hpc, "Syncope or presyncope", "Syncope ou lipothymie"),
      cb("orthopnoea", S.hpc, "Orthopnoea", "Orthopnée"),
      cb("pnd", S.hpc, "Paroxysmal nocturnal dyspnoea", "Dyspnée paroxystique nocturne"),
      cb("oedema", S.exam, "Ankle oedema", "Œdèmes des membres inférieurs"),
      sl("nyha", S.hpc, "NYHA class", "Classe NYHA", [["I", "I"], ["II", "II"], ["III", "III"], ["IV", "IV"]]),
      cb("htn", S.bg, "Known hypertension", "Hypertension artérielle connue"),
      cb("diabetes", S.bg, "Diabetes", "Diabète"),
      cb("lipids", S.bg, "Dyslipidaemia", "Dyslipidémie"),
      cb("fhxCvd", S.bg, "Family history of premature cardiovascular disease", "Antécédents familiaux de maladie cardiovasculaire précoce"),
      ...allVitals, ...background, ...social,
      ta("ecg", S.exam, "ECG findings", "Résultats de l'ECG")],
  },
  {
    id: "resp", icon: "🫁", name: L("Respiratory medicine", "Pneumologie"),
    fields: [onset, duration,
      sl("cough", S.hpc, "Cough", "Toux", [["None", "Absente"], ["Dry", "Sèche"], ["Productive", "Productive"]]),
      sl("sputum", S.hpc, "Sputum colour", "Aspect des expectorations", [["Clear", "Claires"], ["White", "Blanches"], ["Yellow or green", "Jaunes ou vertes"], ["Rusty", "Rouillées"]]),
      cb("haemoptysis", S.hpc, "Haemoptysis", "Hémoptysie"),
      sl("mrc", S.hpc, "MRC dyspnoea scale", "Échelle de dyspnée MRC", [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]),
      cb("wheeze", S.hpc, "Wheeze", "Sifflements respiratoires"),
      cb("pleuritic", S.hpc, "Pleuritic chest pain", "Douleur thoracique d'allure pleurale"),
      cb("nightSweats", S.hpc, "Night sweats", "Sueurs nocturnes"),
      fever, weightLoss,
      cb("tbContact", S.hpc, "Contact with tuberculosis", "Contact avec un cas de tuberculose"),
      tx("occExposure", S.social, "Occupational exposure (asbestos, dust, chemicals)", "Exposition professionnelle (amiante, poussières, produits chimiques)"),
      tx("inhalers", S.bg, "Inhaled treatment and inhaler technique", "Traitement inhalé et technique d'inhalation"),
      tx("vaccResp", S.bg, "Vaccinations (influenza, pneumococcal, COVID-19)", "Vaccinations (grippe, pneumocoque, COVID-19)"),
      nm("peakFlow", S.exam, "Peak expiratory flow", "Débit expiratoire de pointe", U.lMin),
      ...allVitals, ...background, ...social,
      ta("auscultation", S.exam, "Chest auscultation", "Auscultation pulmonaire")],
  },
  {
    id: "gastro", icon: "🩻", name: L("Gastroenterology", "Gastro-entérologie"),
    fields: [onset, duration,
      tx("painSite", S.hpc, "Site of abdominal pain", "Siège de la douleur abdominale"), pain,
      cb("nausea", S.hpc, "Nausea or vomiting", "Nausées ou vomissements"),
      sl("bowel", S.hpc, "Bowel habit", "Transit", [["Normal", "Normal"], ["Diarrhoea", "Diarrhée"], ["Constipation", "Constipation"], ["Alternating", "Alternance diarrhée et constipation"]]),
      sl("stool", S.hpc, "Stool appearance", "Aspect des selles", [["Normal", "Normal"], ["Pale", "Décolorées"], ["Black (melaena)", "Noires (méléna)"], ["Fresh blood", "Sang rouge (rectorragie)"]]),
      cb("dysphagia", S.hpc, "Dysphagia", "Dysphagie"),
      cb("reflux", S.hpc, "Heartburn or reflux", "Pyrosis ou reflux"),
      cb("jaundice", S.exam, "Jaundice", "Ictère"),
      cb("appetiteLoss", S.hpc, "Loss of appetite", "Perte d'appétit"), weightLoss,
      cb("nsaid", S.bg, "NSAID use", "Prise d'AINS"),
      tx("travel", S.social, "Recent travel", "Voyage récent"),
      V.temp, V.hr, V.bp, V.weight, V.height, ...background, ...social,
      ta("abdoExam", S.exam, "Abdominal examination", "Examen abdominal")],
  },
  {
    id: "neuro", icon: "🧠", name: L("Neurology", "Neurologie"),
    fields: [onset, duration,
      cb("headache", S.hpc, "Headache", "Céphalées"),
      tx("headacheChar", S.hpc, "Headache character and location", "Type et localisation des céphalées"),
      cb("weakness", S.hpc, "Focal weakness", "Déficit moteur focal"),
      cb("numbness", S.hpc, "Numbness or tingling", "Engourdissements ou paresthésies"),
      cb("speech", S.hpc, "Speech disturbance", "Troubles de la parole"),
      cb("vision", S.hpc, "Visual disturbance", "Troubles visuels"),
      cb("seizures", S.hpc, "Seizures", "Crises d'épilepsie"),
      cb("vertigo", S.hpc, "Dizziness or vertigo", "Sensations vertigineuses ou vertiges"),
      cb("memory", S.hpc, "Memory problems", "Troubles de la mémoire"),
      nm("gcs", S.exam, "Glasgow Coma Scale", "Score de Glasgow", L("/15", "/15")),
      sl("handed", S.bg, "Handedness", "Latéralité", [["Right-handed", "Droitier"], ["Left-handed", "Gaucher"], ["Ambidextrous", "Ambidextre"]]),
      V.temp, V.hr, V.bp, ...background, ...social,
      ta("neuroExam", S.exam, "Neurological examination", "Examen neurologique")],
  },
  {
    id: "derm", icon: "🧴", name: L("Dermatology", "Dermatologie"),
    fields: [
      tx("site", S.hpc, "Lesion location", "Localisation de la lésion"),
      nm("size", S.exam, "Lesion size", "Taille de la lésion", U.mm),
      sl("duration", S.hpc, "Duration", "Durée d'évolution", [["Under 1 week", "Moins d'une semaine"], ["1 to 4 weeks", "1 à 4 semaines"], ["1 to 6 months", "1 à 6 mois"], ["Over 6 months", "Plus de 6 mois"]]),
      cb("itch", S.hpc, "Itching", "Prurit"),
      cb("painful", S.hpc, "Painful lesion", "Lésion douloureuse"),
      cb("change", S.hpc, "Change in size, shape or colour", "Modification de taille, de forme ou de couleur"),
      cb("bleeding", S.hpc, "Bleeding or ulceration", "Saignement ou ulcération"),
      sl("sun", S.social, "Sun exposure", "Exposition solaire", [["Low", "Faible"], ["Moderate", "Modérée"], ["High", "Importante"]]),
      cb("sunburn", S.bg, "History of sunburn", "Antécédents de coups de soleil"),
      sl("fitz", S.exam, "Fitzpatrick skin type", "Phototype de Fitzpatrick", [["I", "I"], ["II", "II"], ["III", "III"], ["IV", "IV"], ["V", "V"], ["VI", "VI"]]),
      cb("newProducts", S.hpc, "New cosmetics, products or medication", "Nouveaux cosmétiques, produits ou médicaments"),
      cb("atopy", S.bg, "Personal or family history of atopy", "Atopie personnelle ou familiale"),
      ...background, ...social,
      ta("lesionDesc", S.exam, "Lesion description", "Description de la lésion")],
  },
  {
    id: "ent", icon: "👂", name: L("Ear, nose and throat (ENT)", "Oto-rhino-laryngologie (ORL)"),
    fields: [onset, duration, V.temp,
      cb("throat", S.hpc, "Sore throat", "Mal de gorge"),
      cb("earPain", S.hpc, "Ear pain", "Otalgie"),
      cb("earDischarge", S.hpc, "Ear discharge", "Otorrhée"),
      cb("hearing", S.hpc, "Hearing loss", "Baisse de l'audition"),
      cb("tinnitus", S.hpc, "Tinnitus", "Acouphènes"),
      cb("vertigo", S.hpc, "Vertigo", "Vertiges"),
      cb("congestion", S.hpc, "Nasal congestion", "Obstruction nasale"),
      cb("epistaxis", S.hpc, "Nosebleeds", "Épistaxis"),
      cb("dysphagia", S.hpc, "Difficulty swallowing", "Dysphagie"),
      cb("hoarse", S.hpc, "Hoarseness", "Dysphonie"),
      cb("neckLump", S.exam, "Neck lump", "Masse cervicale"),
      ...background, ...social,
      ta("entExam", S.exam, "ENT examination", "Examen ORL")],
  },
  {
    id: "ophth", icon: "👁️", name: L("Ophthalmology", "Ophtalmologie"),
    fields: [onset, duration,
      tx("vaR", S.exam, "Visual acuity, right eye", "Acuité visuelle, œil droit"),
      tx("vaL", S.exam, "Visual acuity, left eye", "Acuité visuelle, œil gauche"),
      cb("red", S.hpc, "Red eye", "Œil rouge"),
      cb("eyePain", S.hpc, "Eye pain", "Douleur oculaire"),
      cb("photophobia", S.hpc, "Photophobia", "Photophobie"),
      cb("discharge", S.hpc, "Eye discharge", "Sécrétions oculaires"),
      cb("blurred", S.hpc, "Blurred vision", "Vision floue"),
      cb("floaters", S.hpc, "Floaters or flashes of light", "Corps flottants ou éclairs lumineux"),
      cb("diplopia", S.hpc, "Double vision", "Diplopie"),
      cb("trauma", S.hpc, "Eye injury", "Traumatisme oculaire"),
      cb("lenses", S.bg, "Contact lens wearer", "Porteur de lentilles de contact"),
      cb("glasses", S.bg, "Wears glasses", "Porteur de lunettes"),
      nm("iop", S.exam, "Intraocular pressure", "Pression intraoculaire", U.mmHg),
      ...background, ...social],
  },
  {
    id: "obgyn", icon: "🤰", name: L("Obstetrics and gynaecology", "Gynécologie et obstétrique"),
    fields: [onset, duration,
      tx("lmp", S.hpc, "First day of last menstrual period", "Date des dernières règles"),
      sl("cycle", S.hpc, "Menstrual cycle", "Cycle menstruel", [["Regular", "Régulier"], ["Irregular", "Irrégulier"], ["Absent", "Absent"]]),
      cb("pregnancy", S.hpc, "Possibility of pregnancy", "Grossesse possible"),
      nm("gestation", S.hpc, "Gestational age", "Âge gestationnel", U.weeks),
      tx("gp", S.bg, "Gravidity and parity", "Gestité et parité"),
      cb("bleeding", S.hpc, "Vaginal bleeding", "Saignement vaginal"),
      cb("discharge", S.hpc, "Abnormal vaginal discharge", "Leucorrhées anormales"),
      pain,
      cb("dyspareunia", S.hpc, "Dyspareunia", "Dyspareunie"),
      tx("contraception", S.bg, "Contraception", "Contraception"),
      tx("smear", S.bg, "Last cervical screening", "Dernier frottis cervico-utérin"),
      V.temp, V.hr, V.bp, V.weight, ...background, ...social,
      ta("pelvicExam", S.exam, "Abdominal and pelvic examination", "Examen abdominal et pelvien")],
  },
  {
    id: "uro", icon: "💧", name: L("Urology", "Urologie"),
    fields: [onset, duration,
      cb("dysuria", S.hpc, "Pain or burning on passing urine", "Brûlures mictionnelles"),
      cb("haematuria", S.hpc, "Haematuria", "Hématurie"),
      cb("frequency", S.hpc, "Urinary frequency", "Pollakiurie"),
      cb("urgency", S.hpc, "Urgency", "Urgenturie"),
      cb("nocturia", S.hpc, "Nocturia", "Nycturie"),
      cb("retention", S.hpc, "Difficulty passing urine", "Difficultés mictionnelles"),
      cb("loinPain", S.hpc, "Loin pain", "Douleur de la fosse lombaire"),
      fever,
      tx("dipstick", S.exam, "Urine dipstick result", "Résultat de la bandelette urinaire"),
      tx("psa", S.bg, "Last PSA result", "Dernier dosage du PSA"),
      cb("stones", S.bg, "History of kidney stones", "Antécédents de lithiase urinaire"),
      cb("ed", S.hpc, "Erectile dysfunction", "Dysfonction érectile"),
      V.temp, V.hr, V.bp, ...background, ...social],
  },
  {
    id: "endo", icon: "⚗️", name: L("Endocrinology and diabetes", "Endocrinologie et diabétologie"),
    fields: [duration, V.weight, V.height, V.bp, V.hr,
      nm("glucose", S.exam, "Capillary blood glucose", "Glycémie capillaire", U.mmolL),
      nm("hba1c", S.bg, "Last HbA1c", "Dernière HbA1c", U.mmolMol),
      cb("polyuria", S.hpc, "Polyuria or polydipsia", "Polyurie ou polydipsie"),
      sl("weightChange", S.hpc, "Weight change", "Évolution du poids", [["Stable", "Stable"], ["Gain", "Prise de poids"], ["Loss", "Perte de poids"]]),
      cb("thermo", S.hpc, "Heat or cold intolerance", "Intolérance au chaud ou au froid"),
      fatigue,
      cb("goitre", S.exam, "Neck swelling (goitre)", "Tuméfaction cervicale (goitre)"),
      cb("hypos", S.hpc, "Episodes of hypoglycaemia", "Épisodes d'hypoglycémie"),
      tx("diabTx", S.bg, "Diabetes treatment", "Traitement du diabète"),
      cb("feet", S.exam, "Foot examination normal", "Examen des pieds normal"),
      ...background, ...social],
  },
  {
    id: "rheum", icon: "🦴", name: L("Rheumatology", "Rhumatologie"),
    fields: [onset, duration,
      tx("joints", S.hpc, "Joints affected", "Articulations atteintes"),
      nm("stiffness", S.hpc, "Duration of morning stiffness", "Durée du dérouillage matinal", U.min),
      cb("swelling", S.exam, "Joint swelling", "Gonflement articulaire"),
      cb("symmetry", S.hpc, "Symmetrical involvement", "Atteinte symétrique"),
      pain,
      cb("backPain", S.hpc, "Inflammatory back pain", "Rachialgies inflammatoires"),
      cb("rash", S.hpc, "Skin rash", "Éruption cutanée"),
      cb("sicca", S.hpc, "Dry eyes or dry mouth", "Sécheresse oculaire ou buccale"),
      cb("raynaud", S.hpc, "Raynaud's phenomenon", "Phénomène de Raynaud"),
      fatigue,
      sl("impact", S.hpc, "Impact on daily activities", "Retentissement sur la vie quotidienne", [["None", "Aucun"], ["Mild", "Léger"], ["Moderate", "Modéré"], ["Severe", "Sévère"]]),
      V.temp, V.bp, V.weight, ...background, ...social,
      ta("mskExam", S.exam, "Musculoskeletal examination", "Examen de l'appareil locomoteur")],
  },
  {
    id: "ortho", icon: "🦵", name: L("Trauma and orthopaedics", "Orthopédie et traumatologie"),
    fields: [
      tx("mechanism", S.hpc, "Mechanism of injury", "Mécanisme du traumatisme"),
      tx("site", S.hpc, "Site of injury", "Siège de la lésion"),
      tx("time", S.hpc, "Time of injury", "Heure du traumatisme"),
      pain,
      cb("weightBear", S.exam, "Able to bear weight", "Appui possible"),
      cb("swelling", S.exam, "Swelling", "Œdème"),
      cb("deformity", S.exam, "Visible deformity", "Déformation visible"),
      cb("nv", S.exam, "Neurovascular status intact", "Examen vasculo-nerveux normal"),
      tx("rom", S.exam, "Range of movement", "Amplitudes articulaires"),
      cb("prevInjury", S.bg, "Previous injury at the same site", "Antécédent de lésion au même endroit"),
      sl("handed", S.bg, "Handedness", "Latéralité", [["Right-handed", "Droitier"], ["Left-handed", "Gaucher"], ["Ambidextrous", "Ambidextre"]]),
      anticoag, V.hr, V.bp, ...background, ...social],
  },
  {
    id: "psych", icon: "🧩", name: L("Psychiatry", "Psychiatrie"),
    fields: [onset, duration,
      sl("mood", S.hpc, "Mood", "Humeur", [["Euthymic", "Euthymique"], ["Low", "Dépressive"], ["Elevated", "Expansive"], ["Irritable", "Irritable"]]),
      cb("anhedonia", S.hpc, "Loss of interest or pleasure", "Perte d'intérêt ou de plaisir (anhédonie)"),
      cb("anxiety", S.hpc, "Anxiety", "Anxiété"),
      sl("sleep", S.hpc, "Sleep", "Sommeil", [["Normal", "Normal"], ["Reduced", "Diminué"], ["Increased", "Augmenté"]]),
      sl("appetite", S.hpc, "Appetite", "Appétit", [["Normal", "Normal"], ["Reduced", "Diminué"], ["Increased", "Augmenté"]]),
      cb("selfHarm", S.hpc, "Thoughts of self-harm", "Idées d'automutilation"),
      cb("suicidal", S.hpc, "Suicidal thoughts", "Idées suicidaires"),
      cb("psychotic", S.hpc, "Hallucinations or unusual beliefs", "Hallucinations ou idées délirantes"),
      nm("phq9", S.exam, "PHQ-9 score", "Score PHQ-9", L("/27", "/27")),
      nm("gad7", S.exam, "GAD-7 score", "Score GAD-7", L("/21", "/21")),
      ta("psychHx", S.bg, "Previous psychiatric history", "Antécédents psychiatriques"),
      tx("support", S.social, "Support network", "Entourage et soutien"),
      ...background, ...social,
      ta("mse", S.exam, "Mental state examination", "Examen de l'état mental")],
  },
  {
    id: "infect", icon: "🦠", name: L("Infectious diseases", "Maladies infectieuses"),
    fields: [onset,
      nm("feverDays", S.hpc, "Duration of fever", "Durée de la fièvre", U.days),
      cb("rigors", S.hpc, "Rigors", "Frissons intenses"),
      cb("rash", S.hpc, "Rash", "Éruption cutanée"),
      tx("travel", S.social, "Recent travel", "Voyage récent"),
      cb("contacts", S.hpc, "Contact with unwell people", "Contact avec des personnes malades"),
      cb("animals", S.social, "Animal or insect exposure", "Exposition aux animaux ou aux insectes"),
      cb("sexual", S.social, "Sexual health risk", "Exposition à un risque sexuel"),
      cb("immuno", S.bg, "Immunocompromised", "Immunodépression"),
      cb("abx", S.bg, "Recent antibiotics", "Antibiothérapie récente"),
      cb("hospital", S.bg, "Recent hospital admission", "Hospitalisation récente"),
      tx("vacc", S.bg, "Vaccination status", "Statut vaccinal"),
      ...allVitals, ...background, ...social,
      ta("exam", S.exam, "Examination findings", "Données de l'examen clinique")],
  },
  {
    id: "geri", icon: "🧓", name: L("Geriatric medicine", "Gériatrie"),
    fields: [onset, duration,
      cb("falls", S.hpc, "Recent falls", "Chutes récentes"),
      cb("confusion", S.hpc, "New confusion", "Confusion récente"),
      nm("mmse", S.exam, "Cognitive score (MMSE)", "Score cognitif (MMSE)", L("/30", "/30")),
      sl("mobility", S.exam, "Mobility", "Mobilité", [["Independent", "Autonome"], ["With walking aid", "Avec aide technique"], ["Requires assistance", "Avec aide humaine"], ["Bed-bound", "Alité"]]),
      sl("continence", S.hpc, "Continence", "Continence", [["Continent", "Continent"], ["Urinary incontinence", "Incontinence urinaire"], ["Faecal incontinence", "Incontinence fécale"], ["Both", "Incontinence mixte"]]),
      cb("nutrition", S.hpc, "Poor nutritional intake", "Apports alimentaires insuffisants"),
      cb("polypharmacy", S.bg, "Five or more regular medicines", "Cinq médicaments ou plus au long cours"),
      cb("sensory", S.hpc, "Vision or hearing impairment", "Troubles visuels ou auditifs"),
      cb("pressure", S.exam, "Pressure area concerns", "Risque d'escarres"),
      tx("carer", S.social, "Carer and support at home", "Aidant et aides à domicile"),
      ...allVitals, ...background, ...social],
  },
  {
    id: "emerg", icon: "🚑", name: L("Emergency medicine", "Médecine d'urgence"),
    fields: [
      tx("event", S.hpc, "Presenting event", "Circonstances de survenue"),
      tx("time", S.hpc, "Time of onset", "Heure de début"),
      sl("avpu", S.exam, "AVPU", "Score AVPU", [["Alert", "Alerte"], ["Responds to voice", "Réagit à la voix"], ["Responds to pain", "Réagit à la douleur"], ["Unresponsive", "Aréactif"]]),
      nm("gcs", S.exam, "Glasgow Coma Scale", "Score de Glasgow", L("/15", "/15")),
      pain,
      cb("loc", S.hpc, "Loss of consciousness", "Perte de connaissance"),
      nm("glucose", S.exam, "Capillary blood glucose", "Glycémie capillaire", U.mmolL),
      anticoag,
      cb("tetanus", S.bg, "Tetanus vaccination up to date", "Vaccination antitétanique à jour"),
      tx("lastMeal", S.hpc, "Time of last meal", "Heure du dernier repas"),
      ...allVitals, ...background, ...social],
  },
  {
    id: "sport", icon: "🏃", name: L("Sport and exercise medicine", "Médecine du sport"),
    fields: [
      tx("sport", S.social, "Sport and level", "Sport pratiqué et niveau"),
      tx("load", S.social, "Weekly training volume", "Volume d'entraînement hebdomadaire"),
      tx("mechanism", S.hpc, "Mechanism of injury", "Mécanisme du traumatisme"),
      tx("site", S.hpc, "Site of injury", "Siège de la lésion"),
      pain,
      cb("weightBear", S.exam, "Able to bear weight", "Appui possible"),
      cb("swelling", S.exam, "Swelling", "Œdème"),
      cb("instability", S.hpc, "Feeling of instability", "Sensation d'instabilité"),
      cb("concussion", S.hpc, "Head injury or concussion symptoms", "Traumatisme crânien ou symptômes de commotion cérébrale"),
      cb("prevInjury", S.bg, "Previous injury at the same site", "Antécédent de lésion au même endroit"),
      tx("rtp", S.hpc, "Target return to sport", "Date de reprise sportive envisagée"),
      V.hr, V.bp, V.weight, V.height, ...background, ...social,
      ta("mskExam", S.exam, "Musculoskeletal examination", "Examen de l'appareil locomoteur")],
  },
];

export const specialtyName = (id: string, lang: Lang) => SPECIALTIES.find((s) => s.id === id)?.name[lang] ?? id;

let counter = 0;
export const uid = () => `f${Date.now().toString(36)}${(counter++).toString(36)}`;

export function defaultTemplate(id: string): Field[] {
  const s = SPECIALTIES.find((x) => x.id === id);
  return s ? s.fields.map((f) => ({ ...f, id: uid(), source: "template" as const })) : [];
}

const tplKey = (id: string) => `anamnesis.tpl2.${id}`;
const oldKey = (id: string, lang: Lang) => `anamnesis.template.${id}.${lang}`;
type Stored = Omit<Field, "id" | "source">;

export function loadTemplate(id: string, lang: Lang): Field[] {
  try {
    const raw = localStorage.getItem(tplKey(id));
    if (raw) return (JSON.parse(raw) as Stored[]).map((f) => ({ ...f, id: uid(), source: "template" }));
    // One-time migration from the older single-language format
    for (const l of [lang, lang === "en" ? "fr" : "en"] as Lang[]) {
      const old = localStorage.getItem(oldKey(id, l));
      if (!old) continue;
      const parsed = JSON.parse(old) as { label: string; type: FieldType; unit?: string | null; options?: string[] | null }[];
      const fields: Field[] = parsed.map((f) => ({
        id: uid(),
        label: fromLang(f.label, l),
        type: f.type,
        unit: f.unit ? fromLang(f.unit, l) : null,
        options: f.options ? f.options.map((o) => fromLang(o, l)) : null,
        section: null,
        source: "template",
      }));
      localStorage.removeItem(oldKey(id, "en"));
      localStorage.removeItem(oldKey(id, "fr"));
      saveTemplate(id, fields);
      return fields;
    }
  } catch {
    /* ignore */
  }
  return defaultTemplate(id);
}

export function saveTemplate(id: string, fields: Field[]) {
  const clean: Stored[] = fields.map(({ key, label, type, unit, options, section }) => ({ ...(key ? { key } : {}), label, type, unit, options, section }));
  localStorage.setItem(tplKey(id), JSON.stringify(clean));
}

export function resetTemplate(id: string) {
  localStorage.removeItem(tplKey(id));
}
