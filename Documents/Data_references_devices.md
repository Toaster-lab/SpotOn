# Tracking female cycle changes in space: data, references & devices

Nov 14, 2026 · Katarzyna Wręczycka

## Overview

Build the core model on plasma proteomics plus measured hormones; use mcPHASES for cycle timing and wearable priors; add gene expression and menstrual-blood samples as optional layers. DNA methylation in blood barely tracks the cycle, so keep it for pre- versus post-flight comparisons.

| Layer | Role | Best open resource | Status for this weekend |
| --- | --- | --- | --- |
| Plasma proteomics | Core molecular cycle clock | UK Biobank 75-protein phase score (published); Inspiration4 proteomics in NASA OSDR | Usable via published score + OSDR |
| Hormones | Ground-truth labels | Mira urine (LH, E3G, PdG, FSH); serum E2, P4, LH, FSH in a real mission | Design only |
| mcPHASES | Cycle timing, heart-rate and temperature priors | PhysioNet (restricted) | Check download status |
| Gene expression | Supporting layer, tissue signals | GSE203191 (menstrual cup scRNA-seq), JAXA cfRNA, HECA atlas | Usable now, fully open |
| Menstrual blood | Monthly needle-free molecular sample | Shih 2022 (GEO), Schwalie 2024 (Zenodo) | Usable now |
| DNA methylation | Pre/post-flight only | Vlasac 2025 (GEO GSE275888) | Future work |

## What is known about female astronaut physiology

No study has reported alterations in menstrual cyclicity or reproductive physiology in response to spaceflight in a female astronaut (Strock, Rivas & Marshall Goebel, NASA JSC). That absence — not a disputed finding — is what this project addresses.

The sample is the reason. Of 360 NASA astronauts selected through ISS Expedition 66, 61 are female (16.9%), flying 139 of 1,094 missions (12.7%). Female astronauts fly longer: mean 40.6 days per mission versus 25.7, and 102.4 cumulative days in space versus 67.6. The Artemis corps is 50% female, with the first woman on the lunar surface targeted for 2030.

Combined oral contraception is commonly prescribed to suppress menses during missions, and the suppression window from candidate selection to flight can exceed a decade ([Jain & Wotring, Medically induced amenorrhea in female astronauts, npj Microgravity 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5516549)). No spaceflight investigation has examined the effect of hormonal contraception on bone health. In analogues, 13-day spaceflight stopped cycling and altered ovarian physiology in rodents while 37 days had limited effect on the oestrous cycle; human bed rest showed no change in menstrual cycle length, but at 17 days was too short to conclude anything.

### Sex differences in deconditioning

| Outcome | Female | Male | Note |
| --- | --- | --- | --- |
| VO₂peak, pre to post flight | −11.8% ± 10.7 | −8.8% ± 7.9 | n = 11 F, 36 M; not significant (p = 0.318) |
| Peak work (W) | −13.3% | −4.9% | p < 0.01 |
| Knee extension strength | −17.2% ± 13.3 | −9.9% ± 14.7 | n = 17 F, 70 M; p = 0.063 |
| Knee extension endurance | −13.6% | −12.1% | p = 0.921 |
| Bone mineral density | up to −1.5% per month | up to −1.5% per month | n = 9 F, 33 M; no sex difference detected |
| Low BMD diagnosis, post-flight | 15% of that sex's diagnoses | 4% | — |
| Injuries occurring in flight | 20% of that sex's injuries | 4% | 92% of all injuries occur post-flight |

In-flight exercise is 2.5 h/day, 6 days/week, which exceeds terrestrial activity guidelines. Chronic energy deficit — high expenditure or low intake — is the strongest known driver of reproductive hormone disruption in exercising women, and male astronauts have shown 5–10% body-mass loss on some missions.

### Venous thromboembolism

VTE affects roughly 1–2 per 1,000 people per year on Earth, and no case has been reported in a female astronaut in the published literature. Jain and Wotring argue that terrestrial risk models do not transfer, because the usual predictors (obesity, smoking) are screened out at selection while spaceflight adds its own: cephalic fluid shifts, lower-limb inactivity, hyperhomocysteinaemia, low methylfolate and minor injuries, on top of hormonal therapy. Their prediction is an elevated risk that still falls short of requiring thromboprophylaxis.

The question is not hypothetical: an occlusive internal jugular vein thrombosis was found in flight during a study of 11 astronauts, with a second suspected partial thrombus ([Marshall-Goebel et al., JAMA Network Open 2019](https://scholarlycommons.henryford.com/surgery_articles/390)).

### Named gaps this project could address

- Whether spaceflight alters menstrual cyclicity or reproductive hormone status at all — never measured.
- Whether long-term menstrual suppression affects bone health in flight.
- Whether hormonal contraception changes VTE risk under microgravity.
- Whether cycle phase moderates the exercise adaptive response, and therefore countermeasure design.

## Plasma proteomics

A 2026 UK Biobank study found 198 of about 3,000 plasma proteins vary across the cycle, and a 75-protein score predicts cycle phase ([Riishede et al., Plasma proteomic signature of the human menstrual cycle, Nature Medicine 2026](https://www.nature.com/articles/s41591-026-04326-5)).

- Cohort: 2,760 women, Olink Explore 3072 panel.
- What varies: reproductive hormones, cytokines and growth factors, many enriched in endometrial tissue; several linked to endometriosis, fibroids and abnormal bleeding.
- Why it fits space: works from blood whether or not periods are suppressed; small plasma volumes; freeze and ship.
- Spaceflight data: Inspiration4 blood datasets OSD-569, -570, -571, -575 in NASA OSDR; processed data open, raw data by application.
- Caveat: different proteomics platforms may cover only part of the 75-protein panel.

### UK Biobank access cost

Proteomics normally sits in Tier 2 but is currently offered at Tier 1 pricing for a limited period.

| Route | First 3 years | Per extra year | Notes |
| --- | --- | --- | --- |
| Student tier | £500 + VAT | £175 | Student or supervisor, one student project; Getting Started Credit of £1,000 compute |
| Tier 1 (incl. proteomics for now) | £3,000 + VAT | £1,000 | Questionnaire, cycle fields, linked health data |
| Tier 2 (normal price) | £6,000 + VAT | £2,000 | Blood assays, proteomics, genotypes |
| Extra institution | £1,000 | £500 | Per added institution |

All analysis runs on the UK Biobank Research Analysis Platform; everyone gets £40 of free compute credit. Approval takes weeks, so it is not usable this weekend.

Useful UK Biobank fields: cycle length (3710), days since last period (3700), had menopause (2724), age at menarche (2714), age at menopause (3581), age started / last used the pill (2794 / 2804), age started HRT (3536).

## mcPHASES

mcPHASES gives daily hormone-based cycle phases plus wearable heart and temperature data from 42 people over 192 complete cycles ([Lin et al., Scientific Data 2026](https://www.nature.com/articles/s41597-026-06805-3); [PhysioNet](https://physionet.org/content/mcphases/1.0.0/)).

- 42 young adults who menstruate, Greater Toronto Area; no hormonal contraception in the prior 3 months; no diabetes.
- Interval 1: Jan–Apr 2022, all modalities. Interval 2: Jul–Oct 2024, 20 returned (hormones + Fitbit; diaries optional).

| Source | Signals |
| --- | --- |
| Mira Plus (urine, daily, morning) | LH, E3G (oestrogen metabolite), PdG (progesterone metabolite); Mira labels 4 phases |
| Fitbit Sense (continuous) | Heart rate, resting HR, HRV, wrist temperature, sleep stages, activity, breathing rate, VO₂ max, oxygen variation, stress score |
| Dexcom G6 CGM | Continuous glucose (Interval 1 only) |
| Diary app | Cramps, mood, flow, stress, sleep, activity |

### Key findings

- Average phase lengths: menstruation 6.2 d, late follicular 7.7 d, ovulation 7.3 d, luteal 10.4 d.
- Phase changes at about 19.6%, 44.4% and 67.1% of the cycle.
- Resting heart rate and nightly skin temperature are lowest in the follicular phase and peak in the luteal phase; replicated in both intervals.
- Mira E3G correlates with serum oestradiol (Nakhuda et al. 2023).

### How to use it

1. Cycle-aware heart baseline: expected resting HR, HRV and temperature per person by cycle %; flag in-flight readings outside it.
2. Phase predictor from wearables, trained on hormone-based labels.
3. Priors for within-person drift (20 people measured 2 years apart).
4. Common time axis (cycle %) to align astronaut samples.
5. Natural-cycle reference versus astronauts who suppress.

Limitations: urine metabolites rather than blood levels; Mira's proprietary phase labels; young participants; firmware changes between intervals; no blood omics.

Access: register on [PhysioNet](https://physionet.org/content/mcphases/1.0.0/) and sign the data use agreement. The PhysioNet page recently said files were no longer downloadable — check. Code: [github.com/chai-toronto/mcphases](https://github.com/chai-toronto/mcphases), which includes a worked [example notebook](https://github.com/chai-toronto/mcphases/blob/main/mcphases_sample_analysis.ipynb) for loading the dataset and joining its physiological, hormonal and self-reported measures. Start there rather than from the file layout: it shows how the authors intend the modalities to be aligned, which is the part that would otherwise take a day to reverse-engineer.

### Related literature

Collected by Weronika alongside the mcPHASES record. Lin et al. is the dataset's own paper; the other three map the cycle with omics layers other than wearables, and are the closest published precedents for what a cycle signature looks like and how to sample it.

| Paper | Why it matters here |
| --- | --- |
| [Lin G, Li JY, Kalani K, Truong KN & Mariakakis A (2026) A longitudinal dataset of physiological, hormonal, metabolic, and self-reported menstrual health data. Scientific Data 13(1):411](https://doi.org/10.1038/s41597-026-06805-3) | The mcPHASES dataset paper itself |
| [Thomas N, Huang K, Schneider-Futschik EK, et al. (2026) A chronobiology-based protocol for multi-omic mapping of menstrual cycle and diurnal rhythms in ME/CFS and long COVID. npj Women's Health 4(1):3](https://doi.org/10.1038/s44294-025-00120-9) | Design template for sampling cycle and diurnal rhythm together across omics layers — the confound we have to separate, since spacecraft light-dark cycles are not Earth's |
| [Wallace M, Hashim YZH-Y, Wingfield M, et al. (2010) Effects of menstrual cycle phase on metabolomic profiles in premenopausal women. Human Reproduction 25(4):949–956](https://doi.org/10.1093/humrep/deq011) | Metabolomic profiles differ by cycle phase — the metabolite analogue of the 75-protein proteomic score |
| [Sukul P, Schubert JK, Trefz P & Miekisch W (2018) Natural menstrual rhythm and oral contraception diversely affect exhaled breath compositions. Scientific Reports 8(1):10838](https://doi.org/10.1038/s41598-018-29221-z) | Breath VOCs track the cycle and differ under oral contraception — a readout requiring no sample, no consumable and no crew time at all |

## Gene expression

Gene expression is the layer with the most open data, and menstrual-cup single-cell datasets are the part usable immediately. No large blood RNA dataset covers the whole cycle, and single-cell work is hard to do in orbit.

### Menstrual-cup datasets (open)

| Dataset | Collection | Cohort | Assay | Access |
| --- | --- | --- | --- | --- |
| [Shih et al. 2022](https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-022-02500-3) (ROSE) | Menstrual cup (DIVA), 4–8 h, heaviest flow day (cycle day 1–2), at home | 33 participants: 9 control, 11 confirmed endometriosis, 13 symptomatic undiagnosed | 10x Chromium 3' v3.1, methanol-fixed; 43,054 cells after QC | [GSE203191](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE203191), open |
| [Schwalie et al. 2024](https://www.medrxiv.org/content/10.1101/2024.05.06.24306766v1.full) | Menstrual cup (Mooncup), day 2 | 15 healthy donors / 25 samples, some donating up to 6 times; plus 7 endometriosis + 11 controls | scRNA-seq (10x 3' v2.0) on 7 samples from 4 donors; 93 bulk BRB-seq samples | Zenodo, open |
| [Single-nucleus menstrual fluid, BMC Medicine 2026](https://link.springer.com/article/10.1186/s12916-026-05020-6) | Menstrual fluid | Endometriosis donors vs controls | snRNA-seq, epithelial focus | Check accession |
| [GSE310627](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE310627) (2026) | Menstrual fluid vs peripheral plasma | — | Small extracellular vesicles | GEO |
| Sanger BLEEDS | — | ≥100 people planned | Single-cell + spatial atlas | Ongoing, no data yet |

Schwalie is the only dataset with repeat sampling from the same donor, which makes it the only within-person longitudinal menstrual transcriptome available.

### Endometrium references across the cycle

| Atlas | Size | Use |
| --- | --- | --- |
| [HECA (Marečková et al., An integrated single-cell reference atlas of the human endometrium, Nat Genet 2024)](https://pubmed.ncbi.nlm.nih.gov/39198675/) | 313,527 cells, 63 women, with and without endometriosis; CC-BY | Reference for scVI/scArches mapping; tissue-of-origin |
| [Wang et al., Nat Med 2020 (GSE111976)](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE111976) | Single-cell endometrium across the cycle | Phase labels and trajectories |
| HCA uterus atlas | >167K cells; shifts by cycle phase | Extra reference |

### Spaceflight data

| Dataset | What | Access |
| --- | --- | --- |
| [JAXA Cell-Free Epigenome study (OSD-530)](https://osdr.nasa.gov/bio/repo/data/studies/OSD-530) | Plasma cfRNA from 6 astronauts, >120 days on ISS, pre/in/post flight | Open; timepoint means with SEM, not per-sample |
| [Inspiration4](https://www.nature.com/articles/s41526-024-00393-5) | RNA-seq, single-nucleus ATAC/RNA-seq, proteomics, CBC; 2 women, 3 days | OSDR; processed open ([OSD-570](https://osdr.nasa.gov/bio/repo/data/studies/OSD-570) PBMC, [OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575) blood serum) |
| NASA Twins Study | One male astronaut, 340 days | Controlled access |

The Endometriosis effluent-classifier reference → query approach (scVI + scArches) maps directly onto Earth → space: train on large Earth references, freeze, map each astronaut. Evaluate per person, not per cell.

## Collection methods

The collection device decides which cells end up in the sample, so it is a batch variable across these datasets rather than a procedural detail.

| Study | Device | Timing | Processing | Data |
| --- | --- | --- | --- | --- |
| [NextGen Jane](https://www.medrxiv.org/content/10.1101/2025.05.21.25327630v2.full) (medRxiv 2025) | Tampon, self-collected at home, mailed in | Cycle days 1–3 | Held in buffer, mean 6.7 days before processing | Not public |
| [Shih et al. 2022](https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-022-02500-3) (ROSE) | Menstrual cup (DIVA), worn 4–8 h; one participant used a collection sponge | Heaviest flow day, typically day 1–2 | Cells methanol-fixed before 10x | [GSE203191](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE203191), open |
| [Schwalie et al. 2024](https://www.medrxiv.org/content/10.1101/2024.05.06.24306766v1.full) | Silicone menstrual cup (Mooncup) | Day 2, healthy cohort | Fresh; median 5 mL volume, median 2.6 million live cells per mL of flow-through | Zenodo, open |

Device choice changes composition directly: Vlasac et al. 2025 found cups recover mostly immune cells while swabs recover mostly epithelial and stromal cells. So differences between a cup dataset and a tampon dataset are partly the device, not the biology. When combining GSE203191 with Schwalie, treat device and fixation as covariates — methanol fixation versus fresh processing is a second batch axis on top of the device.

### NextGen Jane

NextGen Jane is a device validation study, not a dataset: cite it, do not analyse it. The cohort is large — 2,025 RNA-seq and metatranscriptomic datasets from 1,067 tampons across 328 US participants, with a main analysis of 601 tampons from 276 participants over 365 monthly cycles. It also reports DNA exome sequencing with concordance against matched venous blood in 12 participants, and haemoglobin spectrophotometry as a proxy for heavy bleeding. There is no data availability section and no accession number; the data are commercial, and only three summary spreadsheets are supplied.

Its value here is the feasibility argument: tampon-collected menstrual effluent yields usable human and microbial RNA, collected at home, stable in buffer for days before processing. That is the case for a sample type needing no needle, no centrifuge and no cold chain — which is exactly why it suits a spacecraft, where a venous draw and plasma separation have never been performed. Product overview: [ORWH slides (PDF)](https://orwh.od.nih.gov/sites/nih_site/files/docs/09-Tariyal_508c.pdf).

## DNA methylation

No public dataset tracks menstrual-blood methylation across several periods in the same women. That is an open gap a mission design could fill.

| Study | Sample | Finding | Data |
| --- | --- | --- | --- |
| Vlasac et al., Epigenetics 2025 | Menstrual effluent, 12 women, day 2, cup / pad / swab | Methylation cytometry (HiTIMED) works; cups give most immune cells, swabs most epithelial and stromal; mail-in kits with DNA/RNA Shield | [GSE275888](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE275888) |
| Mortlock et al. 2019 | Endometrium + venous blood, 66 women | 27,262 endometrial probes change across the cycle; not seen in blood | Paper |
| El-Maarri et al. 2011 | Venous blood | LINE-1 methylation unaffected by natural hormone cycles | Paper |
| Lee et al. 2016 | Forensic, 201 menstrual blood samples | SLC26A10 CpGs specific to menstrual blood; varies with cycle and collection method | Paper |
| Hsu et al. | Forensic | Marker methylation changes with day of menstruation | Paper |
| [NCT06771583](https://clinicaltrials.gov/study/NCT06771583) (Johns Hopkins) | Dried blood spots, follicular vs luteal | PMDD epigenetic markers, repeated measures | Recruiting |

Takeaways: menstrual-blood methylation mostly reflects which cells are present; DNA is stable and space-friendly; standardise collection (same day, same device, same preservative) every cycle.

## Devices

Only Qvin's Q-Pad is FDA-cleared for a menstrual-blood test (HbA1c). Mira tests urine, so it works for every astronaut, including those who suppress periods.

| Device | Sample | Measures | Readout | Status / price |
| --- | --- | --- | --- | --- |
| Mira Ultra4 kit | Urine | FSH, LH, E3G, PdG | Monitor + app, 16 min | On sale; $249 (20 wands), $269 (30) |
| Qvin Q-Pad | Menstrual blood, dried strip | HbA1c (FDA); TSH, AMH r>0.9 reported; HR-HPV (Thailand) | Mail to lab | FDA-cleared 2024; kit = 2 pads, days 2–4 |
| MenstruAI (ETH Zurich / Empa) | Menstrual blood in pad | 3 protein biomarkers (prototype) | Colour strip, by eye or phone app | Research; Swiss, potential partner |
| Vivoo FlowPad | Menstrual blood, microfluidic pad | Hormones; planned LH, oestrogen metabolites, cortisol, inflammation, iron, infection, pH | App | Shown CES 2026; ~$4–5 per pad |
| NextGen Jane | Tampon | mRNA sequencing, endometriosis | Lab | Clinical studies; data not public |
| theblood (Berlin) | Menstrual blood kit | Endometriosis, early menopause, PCOS, fertility | Lab | Validating |
| LifeStory Health | Menstrual blood | Two menstrual-specific proteins, infertility | Lab | Research |

## Ideas for the space project

The pitch: learn the menstrual cycle on Earth, freeze it, map each astronaut onto it, and read deviations in flight as the effect of space.

1. **Cycle-aware heart monitoring.** Resting heart rate rises in the luteal phase; without a cycle-adjusted baseline, normal changes look like anomalies or hide real ones.
2. **Proteomic cycle clock on routine blood draws.** Apply the 75-protein score to in-flight plasma to estimate phase, suppressed or not.
3. **The period as a monthly needle-free blood test.** Dried menstrual strips stored and returned: haemoglobin and iron (space anaemia), AMH (ovarian reserve, radiation), HbA1c, TSH, CRP.
4. **On-the-spot results for deep space.** MenstruAI-style strips read by the crew's camera and an app; no lab needed.
5. **Full stack for every female astronaut.** Mira urine for all, including confirming suppression (flat LH and PdG); wearables; smart pad or cup for those who menstruate; plasma proteomics.
6. **Menstrual biobank in orbit.** Stable dried spots for later methylation, proteomics or RNA; not done over time even on Earth.

### Proposed measurement stack

**Daily in flight: urine, not blood.** Mira measures LH, E3G, PdG and FSH from urine in 16 minutes with no needle, no centrifuge and no cold chain, which is why it is the in-flight ground truth. A serum panel would require venepuncture and plasma separation — a step never performed in orbit — for a measurement urine already supplies: urinary E3G correlates with serum oestradiol (Nakhuda et al. 2023), and mcPHASES validated its hormone-derived phase labels against the same wearable signals this project uses, so the hormonal and physiological layers are already calibrated against each other on Earth. Urine also covers the whole crew rather than part of it: in astronauts suppressing menses, flat LH and PdG confirm the suppression is holding, which no menstrual sample can do.

**Ground phase: serum.** Serum E2, P4, LH and FSH are measured pre- and post-flight, where venepuncture is available, to validate the urine proxy per person rather than relying on a population-level correlation. Each astronaut carries her own urine-to-serum calibration into flight.

**Monthly in flight: menstrual effluent, sequenced for DNA methylation.** Effluent is a cellular sample, not a cell-free one — Schwalie reports a median 5 mL yielding a median 2.6 million live cells per mL, so roughly 13 million cells per collection. That is micrograms of nucleic acid rather than the nanograms recoverable from plasma, and it removes the input-mass constraint that makes cell-free assays marginal in flight. DNA is the right molecule for the same reasons set out under Assay selection: it tolerates delay, imposes no RNase-free discipline in a closed cabin, and nanopore calls 5mC natively during basecalling with no bisulfite step. Vlasac et al. have already shown that mail-in menstrual-effluent kits preserved in DNA/RNA Shield at ambient temperature support methylation analysis. The readout is therefore the methylation state and cell composition of the endometrium itself — effectively a monthly endometrial biopsy obtained without a biopsy. RNA is deferred to a second phase.

**Reference, and a gap in it.** HECA and Wang et al. define the endometrial cell types and their trajectory across the cycle in expression space, and are the reference for the ground-phase single-cell work on GSE203191 and Schwalie, and for deciding which cell types the flight assay must resolve. They cannot serve directly as the reference for methylation deconvolution, because no comparable endometrial methylation atlas exists: the Loyfer atlas and HiTIMED cover blood cell types, while endometrial epithelium and stroma are not represented. Constructing that reference — matched methylation profiles for the cell types HECA defines — is a phase-1 deliverable in its own right, and is reusable well beyond spaceflight.

## Hackathon demo plan

The sampling cadence shapes the architecture. Every menstrual-cup dataset is collected on cycle day 1–2, because menstrual effluent exists only during menses. So menstrual blood cannot track cycle phase — it gives one molecular snapshot per cycle, always at the same phase.

That is the correct design rather than a limitation: the wearable tracks the cycle continuously, and the cup provides a monthly molecular checkpoint at a fixed phase. It is the same architecture as the onboard crew-health proposal — a continuous passive sentinel plus a periodic molecular confirmation — applied to different biology, with a sample type needing no needle, no centrifuge and no cold chain.

1. Pull Inspiration4 plasma proteomics from OSDR; check overlap with the 75-protein panel.
2. Load mcPHASES with the authors' scripts; build resting HR and temperature curves by cycle % per person.
3. Build the cycle-adjusted heart anomaly detector (per-person mean and spread at each cycle %).
4. Map GSE203191 menstrual-cup cells onto the endometrial reference with scVI/scArches; read out composition per donor.
5. Simulated dashboard for one astronaut over 6 months: hormones, wearables, monthly cup results, both layers on one cycle clock; flag in-flight deviations.
6. Close with the real mission design and UK Biobank access as the scale-up plan.

## Study design tips

With few women and many timepoints, each astronaut must be her own baseline.

1. Record contraception or suppression status first. If periods are suppressed, the question becomes the effect of continuous hormone exposure.
2. Sample at least 2 full pre-flight cycles across phases, then during and after flight.
3. Measure hormones at every draw (serum E2, P4, LH, FSH) as ground truth.
4. Use within-person models (mixed effects, per-person baselines); pooled models overfit with small n.
5. Separate cycle from flight effects. Learn the cycle signature on Earth data, apply it in flight, treat the residual as the flight effect; expect mitochondrial and inflammation shifts in flight.
6. Standardise menstrual sampling: same day (e.g. day 2), same device, same preservative every cycle.

Known limits: only 2 women flew on Inspiration4, for 3 days; about 100 women have ever flown; menstruation has never been measured directly in microgravity. The first dedicated study, Operation Period-01, is planned for 2027.

## Sources

- [Shih et al. 2022, Single-cell analysis of menstrual endometrial tissues (ROSE), BMC Medicine](https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-022-02500-3) · [GSE203191](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE203191)
- [Schwalie et al. 2024, Single-cell characterization of menstrual fluid, medRxiv](https://www.medrxiv.org/content/10.1101/2024.05.06.24306766v1.full)
- [Single-nucleus analysis of menstrual fluid, BMC Medicine 2026](https://link.springer.com/article/10.1186/s12916-026-05020-6)
- [Wang et al. 2020, endometrium across the cycle, GSE111976](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE111976)
- [Marečková et al. 2024, An integrated single-cell reference atlas of the human endometrium (HECA), Nat Genet](https://pubmed.ncbi.nlm.nih.gov/39198675/)
- [GSE310627, small extracellular vesicles from menstrual fluid](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE310627)
- [NextGen Jane: Unlocking uterine biology at home, medRxiv 2025](https://www.medrxiv.org/content/10.1101/2025.05.21.25327630v2.full) · [product overview (ORWH)](https://orwh.od.nih.gov/sites/nih_site/files/docs/09-Tariyal_508c.pdf)
- Strock N, Rivas E, Marshall Goebel K. The Effects of Space Flight and Microgravity Exposure on Female Astronaut Health and Performance. KBR / NASA Johnson Space Center
- [Jain & Wotring 2016, Medically induced amenorrhea in female astronauts, npj Microgravity 2:16008](https://pmc.ncbi.nlm.nih.gov/articles/PMC5516549) · Jain & Wotring, Menstrual cycle control in female astronauts and the associated risk of venous thromboembolism (abstract)
- [Marshall-Goebel et al. 2019, Jugular venous blood flow stasis and thrombosis during spaceflight, JAMA Network Open](https://scholarlycommons.henryford.com/surgery_articles/390)
- [Riishede et al. 2026, Plasma proteomic signature of the human menstrual cycle, Nature Medicine](https://www.nature.com/articles/s41591-026-04326-5)
- [Lin et al. 2026, mcPHASES, Scientific Data](https://www.nature.com/articles/s41597-026-06805-3) · [PhysioNet record](https://physionet.org/content/mcphases/1.0.0/) · [code](https://github.com/chai-toronto/mcphases)
- [Thomas et al. 2026, chronobiology-based protocol for multi-omic mapping of menstrual cycle and diurnal rhythms, npj Women's Health](https://doi.org/10.1038/s44294-025-00120-9)
- [Wallace et al. 2010, Effects of menstrual cycle phase on metabolomic profiles, Human Reproduction](https://doi.org/10.1093/humrep/deq011)
- [Sukul et al. 2018, Natural menstrual rhythm and oral contraception diversely affect exhaled breath compositions, Scientific Reports](https://doi.org/10.1038/s41598-018-29221-z)
- [Inspiration4 data access via OSDR, npj Microgravity 2024](https://www.nature.com/articles/s41526-024-00393-5) · [OSD-530](https://osdr.nasa.gov/bio/repo/data/studies/OSD-530) · [OSD-570](https://osdr.nasa.gov/bio/repo/data/studies/OSD-570) · [OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575)
- [JAXA cfRNA study, Nature Communications 2023](https://www.nature.com/articles/s41467-023-41995-z)
- [Vlasac et al. 2025, GSE275888](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE275888) · Mortlock et al. 2019 · Lee et al. 2016 · [NCT06771583](https://clinicaltrials.gov/study/NCT06771583)
- UK Biobank: access fees · financial support · Research Analysis Platform
- HCA uterus atlas · Sanger BLEEDS · Mira Ultra4 · Q-Pad FDA 510(k) · MenstruAI · Vivoo FlowPad · Operation Period-01