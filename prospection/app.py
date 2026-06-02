import streamlit as st
import subprocess, os, sys, tempfile

st.set_page_config(page_title="Fleeti — Générateur de Leads", page_icon="🚛", layout="centered")

# ── STYLE ──
st.markdown("""
<style>
    .main { max-width: 700px; margin: auto; }
    h1 { color: #1A2A3A; }
    .stButton > button {
        background-color: #1A2A3A;
        color: white;
        width: 100%;
        height: 3rem;
        font-size: 1.1rem;
        border-radius: 8px;
        border: none;
        margin-top: 1rem;
    }
    .stButton > button:hover { background-color: #2d4a6a; }
    .stDownloadButton > button {
        background-color: #28a745;
        color: white;
        width: 100%;
        height: 3rem;
        font-size: 1.1rem;
        border-radius: 8px;
        border: none;
    }
</style>
""", unsafe_allow_html=True)

# ── HEADER ──
st.title("🚛 Fleeti — Générateur de Leads B2B")
st.caption("Données publiques françaises • 100% légal • Export Excel + Odoo")
st.divider()

# ── MAPPINGS ──
APE_MAP = {
    "Transport routier (TRM)":           ["49.41A","49.41B","49.41C"],
    "Transport frigorifique":             ["49.41A","49.41B","49.41C","49.42Z"],
    "Messagerie / Logistique":            ["52.29A","52.29B","52.10B","49.41C"],
    "Déménagement":                       ["49.42Z"],
    "BTP — Gros œuvre":                  ["41.20A","41.20B","43.99C"],
    "BTP — Second œuvre":                ["43.21A","43.22A","43.31Z","43.32A","43.34Z"],
    "BTP — Génie civil":                  ["42.11Z","42.21Z","42.22Z","42.99Z"],
    "Ambulances / Transport sanitaire":   ["86.90A"],
    "Location de véhicules":              ["77.12Z","77.11A","77.11B"],
}

DEP_MAP = {
    "France entière":                [],
    "Île-de-France":                 ["75","77","78","91","92","93","94","95"],
    "Nouvelle-Aquitaine":            ["16","17","19","23","24","33","40","47","64","79","86","87"],
    "Occitanie":                     ["09","11","12","30","31","32","34","46","48","65","66","81","82"],
    "Auvergne-Rhône-Alpes":          ["01","03","07","15","26","38","42","43","63","69","73","74"],
    "PACA":                          ["04","05","06","13","83","84"],
    "Pays de la Loire":              ["44","49","53","72","85"],
    "Bretagne":                      ["22","29","35","56"],
    "Hauts-de-France":               ["02","59","60","62","80"],
    "Grand Est":                     ["08","10","51","52","54","55","57","67","68","88"],
    "Normandie":                     ["14","27","50","61","76"],
    "Centre-Val de Loire":           ["18","28","36","37","41","45"],
    "Bourgogne-Franche-Comté":       ["21","25","39","58","70","71","89","90"],
    "Corse":                         ["2A","2B"],
}

TAILLE_MAP = {
    "10 à 499 salariés (PME)":           ("11","32"),
    "200 à 999 salariés":                ("31","41"),
    "500+ salariés (Grands comptes)":    ("41","53"),
}

# ── FORMULAIRE ──
col1, col2 = st.columns(2)
with col1:
    secteur = st.selectbox("🏭 Secteur", list(APE_MAP.keys()))
with col2:
    zone = st.selectbox("📍 Zone géographique", list(DEP_MAP.keys()))

col3, col4 = st.columns(2)
with col3:
    taille = st.selectbox("👥 Taille d'entreprise", list(TAILLE_MAP.keys()))
with col4:
    nombre = st.number_input("🎯 Nombre de leads", min_value=10, max_value=500, value=50, step=10)

with st.expander("🔑 Clés API"):
    sirene_token = st.text_input("Token SIRENE (obligatoire)", value="4ab9e4a0-a10e-4627-8373-a9afd3a21332", type="password")
    pappers_token = st.text_input("Token Pappers (optionnel — CA + site web)", value="e4ca866896619fff7b5b228022c5d5f0752ecb10366f3bd3", type="password")

st.divider()

# ── GÉNÉRATION ──
if st.button("🚀 Générer ma liste"):
    if not sirene_token:
        st.error("Le token SIRENE est obligatoire.")
        st.stop()

    ape_codes = APE_MAP[secteur]
    departements = DEP_MAP[zone]
    eff_min, eff_max = TAILLE_MAP[taille]

    with tempfile.TemporaryDirectory() as tmpdir:
        output_xlsx = os.path.join(tmpdir, "Prospects_Fleeti.xlsx")
        output_csv  = os.path.join(tmpdir, "Prospects_Fleeti_odoo.csv")

        cmd = [
            sys.executable, "prospection.py",
            "--sirene-token", sirene_token,
            "--ape", *ape_codes,
            "--effectif-min", eff_min,
            "--effectif-max", eff_max,
            "--limit", str(nombre),
            "--output", output_xlsx,
        ]
        if pappers_token:
            cmd += ["--pappers-token", pappers_token]
        else:
            cmd += ["--skip-pappers"]
        if departements:
            cmd += ["--departements", *departements]

        script_dir = os.path.dirname(os.path.abspath(__file__))
        with st.spinner("⏳ Recherche en cours... (1-3 minutes)"):
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=script_dir)

        if result.returncode != 0:
            st.error("Une erreur est survenue.")
            st.code(result.stderr)
        else:
            # Parse résultats
            lines = result.stdout
            total = next((l for l in lines.split("\n") if "Total:" in l), "")
            dirigeants = next((l for l in lines.split("\n") if "dirigeants" in l.lower()), "")

            st.success(f"✅ {total}")
            if dirigeants:
                st.info(f"👤 {dirigeants.strip()}")

            col_dl1, col_dl2 = st.columns(2)
            with col_dl1:
                if os.path.exists(output_xlsx):
                    with open(output_xlsx, "rb") as f:
                        st.download_button("📥 Télécharger Excel", f.read(),
                                           file_name=f"Prospects_Fleeti_{secteur[:15].replace(' ','_')}.xlsx",
                                           mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            with col_dl2:
                if os.path.exists(output_csv):
                    with open(output_csv, "rb") as f:
                        st.download_button("📥 Télécharger CSV Odoo", f.read(),
                                           file_name=f"Prospects_Fleeti_{secteur[:15].replace(' ','_')}_odoo.csv",
                                           mime="text/csv")

st.divider()
st.caption("Données SIRENE (INSEE) • RNE (INPI) • Pappers — Fleeti © 2026")
