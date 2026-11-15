# Reading the cycle, in orbit

**Anomaly detection in women's health from menstrual-blood transcriptomics** — a reference built on open Earth data, designed to be fine-tuned on a crew of two.

NASA Space Apps · Lucerne 2026

---

## Scope: transcriptomics first

Phase 1 is **transcriptomics only**. The molecular layer is the project.

Phase 2 adds the physiological layer — wearable heart rate and HRV, skin temperature, and urine hormone strips (LH, E3G, PdG, FSH) as cycle ground truth. Those are designed for, and referenced throughout, but they are not what we build now. Keeping them out of phase 1 means nothing depends on PhysioNet access, device procurement, or a second modality we would have to align before we have a working molecular pipeline.

---

## Why women, and why now

The practical case for flying women is already being made — on **logistics**, not physiology.

An ESA Space Medicine Team study modelled life-support requirements for all-female crews [3]. Total energy expenditure came out **5–29% lower** than for theoretical male astronauts across body sizes, and **11–41% lower** at 50th-percentile US female stature (1.6 m). Females lost **29% less water through sweating** during a single bout of aerobic countermeasure exercise. A four-member all-female crew would need **1,695 kg less food** on a 1,080-day Mars-class mission. Oxygen consumption, CO₂ production, metabolic heat and water all follow the same direction. NASA's own review makes the same point: smaller body mass and lower resting metabolic rate mean fewer resources, less energy intake and less exercise heat production [1].

That is the real content of "women do better in space" — it is a **body-size and resource argument**, not a claim that female physiology is more robust.

**There is one possible physiological advantage, and it is underpowered.** In 37 astronauts, males had roughly **three times the odds** of developing spaceflight-associated neuro-ocular syndrome (SANS) [4]. All four SANS signs appeared in males; the three female cases showed only globe flattening or refractive shift, with no optic disc oedema or choroidal folds. But the model was **not statistically significant** (χ²(3) = 4.82, p = 0.185), it rests on three women, and the same study found females had *greater* free-water reduction around the brain vertex. Treat it as a hypothesis, not a finding.

**And the ledger runs both ways.** Female astronauts show a greater reduction in maximal external work after flight (−13.3% vs −4.9%, p < 0.01), roughly three times the rate of low bone-mineral-density diagnoses post-flight (15% vs 4% of each sex's diagnoses), and a higher share of injuries occurring in flight (20% vs 4%) [1]. Radiation-attributable cancer risk is higher, which historically constrained career dose limits.

**This is the tension the project sits in.** The case for flying more women is being made on logistics, the Artemis corps is 50% female [1], and the physiological evidence base for women is the thinnest part of spaceflight medicine. Combined oral contraception is routinely prescribed to suppress menses, with a suppression window from candidate selection to flight that can exceed a decade — and no spaceflight study has examined what that does to bone health [2].

---

## The gap

> "No study has reported alterations in menstrual cyclicity or reproductive physiology in response to spaceflight in a female astronaut." [1]

This is not a contested finding being re-tested. It is an absence.

| | |
| --- | --- |
| **61** | of 360 NASA astronauts are women — 12.7% of all missions flown [1] |
| **2** | women flew Inspiration4, for three days. That is the cell-free dataset |
| **2027** | first dedicated study of menstruation in microgravity — Operation Period-01 |

The cohort is tiny and nothing was collected. So we cannot learn the effect from astronaut data. We have to learn *normal* on Earth and bring it with us.

---

## The design

**Monthly molecular checkpoint.** Menstrual effluent, self-collected with a cup. A median 5 mL sample yields a median **2.6 million live cells per mL** — roughly 13 million cells per collection, micrograms of nucleic acid rather than the nanograms plasma cell-free assays recover [7]. Effectively a monthly endometrial biopsy obtained without a biopsy, with no needle, no centrifuge and no cold chain.

**It is a genuine surrogate for biopsy.** Menstrual-fluid epithelial, stromal and immune cells are transcriptionally closer to their counterparts in endometrial biopsies than to one another — they retain cell identity despite being shed [7]. Epithelial and stromal concordance is highest; immune cells diverge most.

**Why monthly, not continuous.** Menstrual effluent exists only on cycle days 1–2. It cannot track phase — it is a fixed-phase snapshot, one per cycle. That is the design, not a limitation: in phase 2 the wearable tracks the cycle continuously and the cup is the periodic confirmation. Same architecture as an onboard crew-health monitor — cheap continuous sentinel, expensive periodic checkpoint.

---

## What we can download today

| Dataset | What it is | Scale | Access |
| --- | --- | --- | --- |
| Shih 2022 [6] | Menstrual cup scRNA-seq, cycle day 1–2, self-collected at home | 33 donors · 43,054 cells | GEO GSE203191, open |
| Schwalie 2024 [7] | Menstrual cup scRNA-seq + 93 bulk BRB-seq; donors sampled up to 6× | 15 healthy donors; 7 endometriosis + 11 controls | Zenodo, open |
| HECA [8] | Integrated endometrial single-cell reference atlas | 313,527 cells · 63 women | CC-BY |
| Wang 2020 [9] | Endometrium across the cycle — phase labels | Single-cell, staged | GEO GSE111976, open |
| OSD-530 · JAXA [10] | Astronaut plasma cfRNA, pre / in / post flight | 6 astronauts · 11 timepoints | OSDR, open |
| mcPHASES [11] | Daily urine hormones + Fitbit HR, HRV, temperature | 42 people · 192 cycles | PhysioNet, DUA — *phase 2* |

In-flight wearable data sits behind TRISH EXPAND and raw astronaut sequence behind OSDR controlled access [20]. Nothing we promise depends on either.

---

## Step one: learn "normal" on Earth, then freeze it

The reference is built once and never retrained. Every astronaut, and every later month, is mapped onto it.

**Tissue atlases** — HECA defines the endometrial cell types (313,527 cells, 63 women) [8]; Wang 2020 supplies cycle-phase labels [9]; the HCA uterus atlas adds coverage.

**Self-collected data** — Shih 2022 shows which cells actually come out in a cup, in controls and endometriosis [6]. Schwalie adds the same donors month after month [7]. This is the sample type a crew can realistically produce.

**Why both.** A biopsy atlas alone would be wrong: menstrual effluent is not an endometrial biopsy. Flow-through is dominated by CD45⁺ cells — a median 83% — and unsorted samples vary widely in composition [7]. Anchor cell-type identity in HECA; calibrate what a real collection looks like using the cup datasets.

---

## The model: scVI → scANVI → scArches

1. **scVI** builds the latent space — variational autoencoder, negative-binomial likelihood, batch and covariates modelled explicitly [12].
2. **scANVI** carries the labels — semi-supervised, so HECA's cell-type annotations propagate to unlabelled cup data [13].
3. **scArches** maps each new sample — reference frozen, only small adaptor weights train [14]. A few hundred cells and a few minutes per astronaut.

The reference never shifts, so last year's result stays comparable, and every new month or new crew member is an adaptor rather than a retrain. It is the same frozen-backbone pattern the wearable foundation models use, built for single-cell.

This is the whole reason the architecture works at our sample size: 313,000 reference cells against maybe two astronauts. Anything requiring retraining on the combined data would be dominated by the reference and would change every time new data arrived.

---

## What the model must be told

Otherwise it learns the lab, not the biology.

- **Collection device** — DIVA cup [6], Mooncup and LadyCup [7], tampon such as nextgen jane [21], swab. Cups recover mostly immune cells; swabs mostly epithelial and stromal [15]. The device changes composition directly.
- **Processing** — Shih methanol-fixed before 10x [6]; Schwalie's healthy cohort serially filtered and processed fresh, while its endometriosis cohort used a Histopaque density gradient [7]. Within that one study, device and protocol are confounded with cohort.
- **Chemistry and donor** — 10x 3′ v2.0 [7] versus v3.1 [6], and donor identity. Cells from one woman are not independent observations.
- **Culture** — cultured menstrual-fluid cells are preponderantly stromal and transcriptionally distinct from fresh ones; the CD45⁺ fraction typically fails to attach [7]. Only fresh samples represent the immune compartment.

A difference between a cup dataset and a tampon dataset is partly the device. Declare these as covariates or you publish a plastic artefact.

---

## Scoring: don't classify

There is no class for "abnormal". Score deviation instead, on four signals:

1. **Reconstruction error** — ELBO under the frozen reference. High means a cell unlike anything the reference has seen.
2. **kNN purity** — what fraction of a query cell's neighbours are reference cells. Low means a genuinely novel state.
3. **Composition shift** — label transfer, then proportions against her own baseline. The most interpretable signal.
4. **Distributional distance** — MMD or Wasserstein between this month's latent distribution and her baseline. **Lead with this one.**

**The unit of analysis is the person, not the cell.** Forty thousand cells from thirty women is thirty observations. Treat cells as independent and you get spectacular p-values that mean nothing.

---

## The null model: established, and computable from open data

Any anomaly score has to clear **normal between-cycle variation in the same person** before it means anything. Without that noise floor, the detector reports its own batch structure.

**The good news: someone has already shown the signature is stable.** Schwalie et al. looked directly at this — *"Cycle-to-cycle variability in MF transcriptomic profiles has not been previously characterised"* — and found that samples from the same donor clustered together more often than expected by chance across multiple cycles, in CD45⁺ ex vivo samples [7]. Donors could donate up to six times, linked by anonymous identifier.

That is the precondition for personal baselines working, and it is published rather than assumed.

**What is still open is the number.** Their result is a Spearman correlation heatmap, not a distribution of effect sizes. Quantifying the floor — how large a shift has to be before it exceeds normal month-to-month variation — is our contribution, and it needs their sample-level data.

### The deposit

One paper, two venues: a **medRxiv preprint** (6 May 2024) and an **eLife Reviewed Preprint** v1 (19 November 2024, "Not revised"; eLife assessment — findings *useful*, evidence *solid*) [7]. Authors: Schwalie, Bafligil, Russeil, Zachara, Biocanin, Alpern, Aasna, Deplancke, Canny, Goncalves (corresponding, a.goncalves@dkfz.de), from the Deplancke lab at EPFL with Wellcome Sanger involvement.

Data availability, verbatim:

> "All data produced in the present work are contained in the manuscript and available online at 10.5281/zenodo.11105267"

The Zenodo record (v0.1.0, 2 May 2024, 73 MB, Open) holds **per-sample data, not just result tables**:

| File | Size | What it gives us |
| --- | --- | --- |
| `endometriosis_bulkRNA_counts.tsv` | 8.2 MB | Per-sample bulk count matrix — the 93 BRB-seq samples |
| `endometriosis_bulkRNA_sample_metadata.tsv` | 4.9 kB | Sample table, including donor identity |
| `healthy_scRNAseq_l{13,14,15,20,21,26,27}_raw_gene_bc_matrices.h5` | 3.3–22 MB each | Seven 10x libraries — the scRNA-seq samples from 4 healthy donors |
| `healthy_scRNA_cell_metadata.tsv` · `healthy_scRNA_sample_metadata.tsv` | 237 kB · 1 kB | Cell and sample annotations |

**The floor is therefore directly computable, from the bulk file.** Restrict to CD45⁺ ex vivo samples, group by donor, and report same-donor concordance as a *distribution* rather than the correlation heatmap of Fig. 4G. That is a direct extension of the authors' own analysis and it is the number the detector needs.

Two practical notes. The `.h5` files are CellRanger **raw** gene-barcode matrices — all barcodes including empty droplets — so filtering is ours to do, which is preferable (the authors used CellBender plus adaptive thresholds). And the single-cell side covers healthy donors only; the repeat-donor structure lives in the bulk file, which spans the endometriosis cases and the 11 controls.

The paper carries no EGA, GEO or ArrayExpress accession, so raw reads are not public — but nothing in this plan needs them.

---

## In orbit there are no single cells

No sorting, no cold chain, no 10x controller. In-flight nanopore on menstrual effluent will be **bulk**. The pipeline therefore splits in two, and they are different algorithms:

**On Earth, reference side** — scVI + scArches on HECA, Shih and Schwalie. Builds and validates the latent space, fixes the cell-type definitions, measures the noise floor.

**In flight, query side** — bulk sequencing, then deconvolution against a signature derived from that same reference (MuSiC [16], BayesPrism [17]). Output is composition per sample, on one cycle clock.

**This has precedent in exactly this sample type.** Schwalie et al. deconvolved their 93 bulk BRB-seq samples with MuSiC, using Shih et al. as the single-cell reference, and recovered the expected composition differences between fresh and cultured samples [7]. The flight-side architecture is not speculative — it has been run, on menstrual fluid, with these datasets.

Design for both now. Build only for mapping and in six months the flight data will not fit the model.

---

## Over time: each woman becomes a trajectory

One summary per sample, one sample per cycle. Samples keep arriving, so the temporal layer must tolerate small *n* and irregular spacing.

- **Z-score + CUSUM** per donor on the latent summary. Catches sustained drift, not just spikes. No training cohort, fully interpretable, and it is the bar learned methods must clear. Start here.
- **Gaussian process per donor** — smooth trajectories with uncertainty, irregular sampling handled properly. Right once there are enough timepoints per person.
- **MEFISTO** [18] — for phase 2, when the wearable and hormone layers join: multiple views, few samples, non-aligned sampling, missing data tolerated by construction. A shared factor across layers is direct evidence they track the same process.

---

## The honest limit: three exposures, one sample

- **Altered light–dark cycle** — sixteen sunrises a day and an imposed schedule. The diurnal reference from Earth does not transfer.
- **Radiation** — cumulative, far higher beyond low Earth orbit.
- **Microgravity** — fluid shifts, unloading, altered immune function.

Every flight sample carries all three at once. With two to six astronauts, no model separates them. We say so rather than implying the model disentangles what the design cannot.

What we can do meanwhile: define a spaceflight-response gene programme from OSDR mouse tissue and Inspiration4 PBMC data [20], and test whether it is active — rather than trying to learn the effect from scratch.

---

## On foundation models: worth considering, not the bottleneck

Single-cell foundation models — **scGPT**, **Geneformer** — are genuinely interesting here, and the natural question is whether fine-tuning one beats scVI for a reference this size. Worth evaluating once the pipeline exists and there is enough query data to tell the difference.

But they are not where the weekend goes, and there is direct evidence why.

**FemWear** [19] specialised a wearable foundation model on **mcPHASES** — the same 42 participants we would use. On a fixed split it reported **+8.15%** cycle-phase macro-F1. Under a strict 42-participant leave-one-out audit the same result was **−1.11%**; **no endpoint** had a strictly positive confidence interval after correction; and at matched capacity it **failed against a plain shared GRU**. Phase macro-F1 came out around 0.30 on four classes, where chance is 0.25.

Two readings, both useful:

- **Model sophistication is not the binding constraint.** The reference and the noise floor are. At this sample size a sophisticated model cannot be shown to be better even if it is.
- **Phase inference from a watch alone is weak** — an argument *for* the design, not against it. It is why phase 2 adds hormone ground truth rather than relying on wearables to infer phase.

Also out of scope for now: per-cell statistics that treat cells as independent samples. That is not a sophistication question, it is a correctness one.

---

## What we build, in order

1. **scVI on HECA + GSE203191** [8,6,12], with device, chemistry and donor declared as batch. Label transfer from the atlas.
2. **Per-donor cell-type composition** read out of the mapped data — the interpretable output everything else hangs off.
3. **The noise floor** — `endometriosis_bulkRNA_counts.tsv` joined to its sample metadata [7], restricted to CD45⁺ ex vivo samples, grouped by donor. What does a normal month-to-month change look like, as a distribution?
4. **Replay** — map a held-out donor onto the frozen reference and score it with the four signals, to show the detector runs end to end on data it has not seen.

Phase 2, later: cycle-adjusted wearable baselines from mcPHASES [11], urine hormone strips as ground truth, both layers on one cycle clock.

Everything in phase 1 uses data we can download tonight. Nothing waits on an application.

---

## References

1. Strock N, Rivas E, Marshall Goebel K. *The Effects of Space Flight and Microgravity Exposure on Female Astronaut Health and Performance.* KBR / NASA Johnson Space Center.
2. Jain V, Wotring VE. Medically induced amenorrhea in female astronauts. *npj Microgravity* 2016;2:16008. https://pmc.ncbi.nlm.nih.gov/articles/PMC5516549
3. Scott JPR, et al. Effects of body size and countermeasure exercise on estimates of life support resources during all-female crewed exploration missions. *Scientific Reports* 2023. doi:10.1038/s41598-023-31713-6
4. McGregor HR, Hupfeld KE, Pasternak O, et al. Crewmember demographic factors and their association with brain and ocular changes following spaceflight. *npj Microgravity* 2025;11:59. doi:10.1038/s41526-025-00505-9
5. Marshall-Goebel K, et al. Assessment of jugular venous blood flow stasis and thrombosis during spaceflight. *JAMA Network Open* 2019. https://scholarlycommons.henryford.com/surgery_articles/390
6. Shih AJ, Adelson RP, Vashistha H, et al. Single-cell analysis of menstrual endometrial tissues defines phenotypes associated with endometriosis. *BMC Medicine* 2022;20:315. https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-022-02500-3 · GEO GSE203191
7. Schwalie PC, Bafligil C, Russeil J, Zachara M, Biocanin M, Alpern D, Aasna E, Deplancke B, Canny G, Goncalves A. Single-cell characterization of menstrual fluid at homeostasis and in endometriosis. *eLife Reviewed Preprint* 2024. doi:10.7554/eLife.99558.1 · medRxiv 2024.05.06.24306766 · data Zenodo 10.5281/zenodo.11105267
8. Marečková M, et al. An integrated single-cell reference atlas of the human endometrium (HECA). *Nature Genetics* 2024. https://pubmed.ncbi.nlm.nih.gov/39198675/
9. Wang W, Vilella F, Alama P, et al. Single-cell transcriptomic atlas of the human endometrium during the menstrual cycle. *Nature Medicine* 2020;26:1644–53. GEO GSE111976
10. JAXA Cell-Free Epigenome study. NASA OSDR OSD-530. https://osdr.nasa.gov/bio/repo/data/studies/OSD-530 · companion paper *Nature Communications* 2023, doi:10.1038/s41467-023-41995-z
11. Lin G, Li JY, Kalani K, Truong KN, Mariakakis A. A longitudinal dataset of physiological, hormonal, metabolic, and self-reported menstrual health data (mcPHASES). *Scientific Data* 2026;13(1):411. doi:10.1038/s41597-026-06805-3 · https://physionet.org/content/mcphases/1.0.0/
12. Lopez R, Regier J, Cole MB, Jordan MI, Yosef N. Deep generative modeling for single-cell transcriptomics (scVI). *Nature Methods* 2018;15:1053–8.
13. Xu C, Lopez R, Mehlman E, Regier J, Jordan MI, Yosef N. Probabilistic harmonization and annotation of single-cell transcriptomics data with deep generative models (scANVI). *Molecular Systems Biology* 2021;17:e9620.
14. Lotfollahi M, Naghipourfar M, Luecken MD, et al. Mapping single-cell data to reference atlases by transfer learning (scArches). *Nature Biotechnology* 2022;40:121–30.
15. Vlasac IM, et al. Menstrual effluent methylation cytometry across collection devices. *Epigenetics* 2025. GEO GSE275888
16. Wang X, Park J, Susztak K, Zhang NR, Li M. Bulk tissue cell type deconvolution with multi-subject single-cell expression reference (MuSiC). *Nature Communications* 2019;10:380.
17. Chu T, Wang Z, Pe'er D, Danko CG. Cell type and gene expression deconvolution with BayesPrism. *Nature Cancer* 2022;3:505–17.
18. Velten B, Braunger JM, Argelaguet R, et al. Identifying temporal and spatial patterns of variation from multimodal data using MEFISTO. *Nature Methods* 2022;19:179–86.
19. Wang Y, Li C. FemWear: A Parameter-Efficient Wearable Foundation Model for Women's Health. arXiv:2608.08244.
20. Inspiration4 data access through the NASA Open Science Data Repository. *npj Microgravity* 2024. doi:10.1038/s41526-024-00393-5
21. https://orwh.od.nih.gov/sites/nih_site/files/docs/09-Tariyal_508c.pdf