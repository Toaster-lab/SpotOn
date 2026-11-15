# SpotOn — Input, Methods, Output

**Anomaly detection in women's health from menstrual-blood transcriptomics.**
A reference built on open Earth data, designed to be adapted to a small female crew.

NASA Space Apps · Lucerne 2026 · github.com/Toaster-lab/SpotOn

---

# Part 1 — The short version

## Input

**Four open human datasets, 111 women, downloadable today without an application.**

- Two menstrual-blood single-cell datasets — what a menstrual cup actually collects (Shih 2022, 33 women; Schwalie 2024, 15 healthy donors with repeat sampling).
- Two endometrial reference atlases — what the cell types are and how they change across the cycle (HECA, 63 women; Wang 2020).

In flight, the input is one self-collected menstrual cup sample per cycle, sequenced on board.

## Methods

1. **Integrate** the four datasets into one latent space with a variational autoencoder, declaring collection device, fixation, chemistry and donor as batch variables.
2. **Freeze** that reference. Every later sample is mapped onto it rather than retrained with it.
3. **Measure the noise floor** — how much a healthy woman's menstrual transcriptome changes between her own cycles. This comes from Schwalie's repeat donors and, as far as we can establish, has never been quantified.
4. **Adapt per astronaut** — each new in-flight sample trains a small set of new weights on the frozen reference and updates her personal baseline.
5. **Score deviation, not disease.** Distance from her own history, measured against the noise floor.

## Output

**One number per sample: a percentile, 0–100.** *"This month sits at the 92nd percentile of normal between-cycle variation."*

Plus an interpretable readout — which cell types shifted — and the noise-floor distribution itself, which is a reusable result for the field whether or not anyone flies.

Not a diagnosis. Not a yes/no. A graded risk signal a flight surgeon can act on, computed on board with no link to Earth.

---

# Part 2 — The detailed version

## 1. Input data

### 1.1 Reference atlases — cell-type identity and cycle phase

| Dataset | Scale | Role | Access |
| --- | --- | --- | --- |
| **HECA** — Marečková et al., *Nature Genetics* 2024 | 313,527 cells · 63 individuals | Defines endometrial cell types; integrates six public datasets | CC-BY · [paper](https://pubmed.ncbi.nlm.nih.gov/39198675/) |
| **Wang et al.**, *Nature Medicine* 2020 | Single-cell endometrium, staged | Cycle-phase labels and trajectories | [GEO GSE111976](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE111976) |

> **Note on counting.** HECA already integrates Wang (GSE111976) among its six constituent datasets, so these are not additive. HECA's 63 donors is the correct atlas figure. HECA also has a companion single-nucleus dataset (312,246 nuclei, 63 donors, five overlapping) — we use the scRNA-seq side.

### 1.2 Menstrual blood — what a cup actually yields

| Dataset | Device & timing | Cohort | Assay | Access |
| --- | --- | --- | --- | --- |
| **Shih et al.**, *BMC Medicine* 2022 (ROSE) | DIVA cup, worn 4–8 h, cycle day 1–2, self-collected at home | 33 participants (9 control, 11 confirmed endometriosis, 13 symptomatic undiagnosed) | 10x 3′ v3.1, methanol-fixed; 43,054 cells after QC | [GSE203191](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE203191), open |
| **Schwalie et al.**, *eLife* Reviewed Preprint 2024 | Mooncup, day 2, processed fresh | 15 healthy donors / 25 samples **with repeat donation**; plus 7 endometriosis + 11 controls | scRNA-seq (10x 3′ v2.0) on 7 libraries from 4 donors; **93 bulk BRB-seq samples** | [Zenodo 10.5281/zenodo.11105267](https://zenodo.org/records/11105267), open |

### 1.3 Spaceflight data that exists

| Dataset | Content | Access |
| --- | --- | --- |
| **JAXA Cell-Free Epigenome**, OSD-530 | Plasma cfRNA, 6 astronauts, >120 d on ISS, pre/in/post | [OSDR](https://osdr.nasa.gov/bio/repo/data/studies/OSD-530), open — timepoint means with SEM, not per-sample. Companion paper *Nat Commun* 2023, doi:10.1038/s41467-023-41995-z |
| **Inspiration4** | RNA-seq, snATAC/RNA, proteomics; 2 women, 3 days | OSDR, processed open ([OSD-570](https://osdr.nasa.gov/bio/repo/data/studies/OSD-570), [OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575)) |

**Neither is menstrual blood.** No menstrual sample has ever been collected in spaceflight. The first dedicated study, Operation Period-01, is planned for 2027.

### 1.5 The flight assay is not hypothetical — nanopore has already flown

The in-flight step we propose is the one part of this project that has already been demonstrated in orbit, by someone else, years ago.

| Milestone | What was done | Citation |
| --- | --- | --- |
| **First DNA sequencing in space**, 2016 | MinION run aboard the ISS by astronaut Kate Rubins. Nine runs over six months, 276,882 reads, **no decline in performance over time**. Directed assembly reached 100% identity for the *E. coli* and lambda genomes; de novo assembly recovered 99.9% of the *E. coli* genome at 98.6% identity. Real-time analysis was done on a laptop on board. | Castro-Wallace SL, Chiu CY, John KK, et al. *Nanopore DNA Sequencing and Genome Assembly on the International Space Station.* **Scientific Reports** 2017;7(1):18022. doi:[10.1038/s41598-017-18364-0](https://www.nature.com/articles/s41598-017-18364-0) |
| **First direct RNA sequencing in space**, Aug 2018 | Native RNA strands sequenced on a MinION aboard the ISS by astronaut Ricky Arnold, under the BEST (Biomolecule Extraction and Sequencing Technology) investigation. Direct RNA — no cDNA conversion step. | Reported by Oxford Nanopore and UC Santa Cruz, [Aug 2018](https://nanoporetech.com/news/news-international-space-station-update-direct-rna-sequencing-space). **Press announcement, not a peer-reviewed paper** — cite as a demonstration, not a result. |

**Why this matters for our design.** Every other in-flight molecular assay we might have proposed requires something a spacecraft does not have: a centrifuge, a cold chain, a 10x controller, or a venous draw with plasma separation — a procedure never performed in orbit. Nanopore requires a USB-powered device and a laptop, it has flown, it has run for six months without degrading, and it has already sequenced native RNA in microgravity.

So the flight half of this pipeline rests on demonstrated hardware. The missing piece is not the sequencer — it is the sample. Nobody has yet put menstrual effluent into one.

### 1.4 The in-flight sample

Menstrual effluent, self-collected with a cup. Schwalie reports a median **5 mL** yielding a median **2.6 million live cells/mL** — roughly **13 million cells per collection**, i.e. micrograms of nucleic acid rather than the nanograms plasma cell-free assays recover. This removes the input-mass constraint that makes cell-free assays marginal in flight, and requires no needle, no centrifuge and no cold chain.

It is a genuine surrogate for biopsy: menstrual-fluid epithelial, stromal and immune cells are transcriptionally closer to their counterparts in endometrial biopsies than to one another.

**Cadence constraint, stated deliberately.** Menstrual effluent exists only on cycle days 1–2. It cannot track cycle phase — it is a fixed-phase snapshot, one per cycle. That is the design: a monthly molecular checkpoint, with the continuous layer deferred to phase 2.

---

## 2. Methods

### 2.1 Preprocessing and QC

- **Single-cell (Earth):** CellBender for ambient RNA and empty droplets; doublet and mitochondrial-fraction filtering. Schwalie ships raw CellRanger matrices, so thresholds are ours to set rather than inherited.
- **Bulk (Earth and flight):** CPM normalisation, log1p, high-variance gene selection.
- **Nanopore (flight):** Dorado basecalling → minimap2 alignment → transcript quantification (NanoCount / Bambu).
- **scVI takes raw counts**, not normalised data — it models counts with a negative-binomial likelihood and handles library size internally.

### 2.2 Batch structure — what the model must be told

Declared as covariates, because otherwise the model learns the lab rather than the biology:

- **Collection device** — DIVA cup (Shih), Mooncup (Schwalie), tampon, swab. Vlasac et al. 2025 showed cups recover mostly immune cells while swabs recover mostly epithelial and stromal — the device changes composition directly ([GSE275888](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE275888)).
- **Fixation / processing** — Shih methanol-fixed before 10x; Schwalie's healthy cohort processed fresh and serially filtered, its endometriosis cohort on a Histopaque gradient. Within that one study, protocol is confounded with cohort.
- **Chemistry** — 10x 3′ v2.0 (Schwalie) vs v3.1 (Shih).
- **Donor identity** — cells from one woman are not independent observations.
- **Culture status** — cultured menstrual-fluid cells are preponderantly stromal; the CD45⁺ fraction typically fails to attach. Only fresh samples represent the immune compartment.

Flow-through is dominated by CD45⁺ cells (median ~83% in Schwalie), which is why an atlas alone is not a sufficient reference.

### 2.3 Integration and reference construction

| Step | Method | Citation |
| --- | --- | --- |
| Latent space | **scVI** — variational autoencoder, NB likelihood, batch modelled explicitly | Lopez et al., *Nature Methods* 2018;15:1053–8 |
| Label transfer | **scANVI** — semi-supervised; HECA annotations propagate to unlabelled cup data | Xu et al., *Mol Syst Biol* 2021;17:e9620 |
| Query mapping | **scArches** — architectural surgery: reference weights frozen, new condition-specific weights trained on the query | Lotfollahi et al., *Nature Biotechnology* 2022;40:121–30 |

**Why frozen-reference mapping and not a retrain.** 350,000+ reference cells against two astronauts. Any method that retrains on the pooled data is dominated by the reference and changes every time new data arrives, so results stop being comparable across months. scArches trains only a small set of new weights per batch — minutes per astronaut, nothing to overfit, and the Earth half physically cannot shift. Once enough flight samples accumulate, the reference is rebuilt as a new **dated version**, so nothing already measured changes silently.

### 2.4 The null model — our main technical contribution

Any anomaly score must clear **normal between-cycle variation in the same person** before it means anything. Without that, the detector reports its own batch structure.

Schwalie et al. established that the signature is stable — same-donor samples cluster together more often than chance across cycles, in CD45⁺ ex vivo samples — but reported it as a Spearman correlation heatmap (Fig. 4G), not a distribution of effect sizes.

**We compute the distribution.** Working from the donors who were sampled more than once, and restricted to one comparable stratum so that protocol differences are not mistaken for biology:

1. Summarise each sample as a **cell-type composition vector** — the proportions read out after mapping onto the frozen reference.
2. Measure the distance between every pair of samples.
3. Split those pairs in two: **same woman, different cycle** versus **different women**. The first distribution is the noise floor; the second shows how much larger between-person differences are, and therefore why a population average cannot serve as a baseline.
4. Leave one sample out at a time: for each sample, its distance to that donor's other samples. The spread of those values across healthy women is the null distribution every later score is read against.

**Why this is the contribution.** It converts a qualitative statement — "the signature is stable" — into a number with units, and that number is what makes an anomaly score mean anything. Without it there is no principled threshold, only a model's own batch structure dressed up as biology. It is also reusable: any future study of the menstrual transcriptome needs to know how much a healthy woman varies between cycles, whether or not anyone goes to space.

### 2.5 In flight there are no single cells

No sorting, no cold chain, no 10x controller. In-flight nanopore on menstrual effluent is **bulk**, so the pipeline splits into two different algorithms:

- **Earth / reference side** — scVI + scANVI + scArches on HECA, Shih, Schwalie. Builds and validates the latent space, fixes cell-type definitions, measures the noise floor.
- **Flight / query side** — bulk nanopore sequencing on a MinION (see §1.5 — the device has flown and has already sequenced native RNA on the ISS), then deconvolution against a signature derived from that same reference: **MuSiC** (Wang et al., *Nat Commun* 2019;10:380) or **BayesPrism** (Chu et al., *Nature Cancer* 2022;3:505–17). Output is cell-type composition per sample.

**One honest consequence of the split.** Earth reference data is Illumina short-read; the flight assay is nanopore long-read. That platform difference is itself a batch effect, so part of any Earth-vs-flight difference would be the machine, not the biology. Two mitigations, both already in the design: each astronaut is compared primarily against *her own* earlier nanopore samples, same device, so the platform term cancels; and a bridging set of Earth samples run on nanopore would calibrate the cross-platform offset directly.

**This has precedent in exactly this sample type.** Schwalie et al. deconvolved their 93 bulk BRB-seq samples with MuSiC using Shih et al. as the single-cell reference, and recovered the expected composition differences between fresh and cultured samples. The flight-side architecture is not speculative.

### 2.6 Scoring — deviation, not classification

There is no "abnormal" class to train on, and no menstrual sample has ever been collected in orbit, so supervised classification is not available even in principle. We score deviation on four signals:

1. **Distributional distance** — MMD or Wasserstein between this month's latent distribution and her baseline. **The lead signal.**
2. **Composition shift** — label transfer, then cell-type proportions against her own baseline. The most interpretable.
3. **Reconstruction error** — ELBO under the frozen reference; high means a cell unlike anything seen.
4. **kNN purity** — fraction of a query cell's neighbours that are reference cells; low means a genuinely novel state.

**Two statistical commitments.**

- **The unit of analysis is the person, not the cell.** 40,000 cells from 30 women is 30 observations. Treating cells as independent produces spectacular p-values that mean nothing.
- **Scale the distance by normal variation.** Plain Euclidean treats every latent dimension as equally meaningful; dividing each by its healthy variability (a Mahalanobis-style distance) builds the noise floor into the metric itself. Cell-type proportions are compositional, so they are CLR-transformed before any Euclidean distance.

### 2.7 Over time

One summary per sample, one sample per cycle — so the temporal layer must tolerate small *n* and irregular spacing.

- **Per-donor z-score + CUSUM** on the latent summary. Catches sustained drift rather than spikes, needs no training cohort, fully interpretable, and is the bar any learned method must clear. **Start here.**
- **Gaussian process per donor** once there are enough timepoints.

### 2.8 Validation

- **Leave-one-donor-out:** hold a woman out of the reference, map her back, confirm she lands where she should.
- **Null model first:** no anomaly is reported until it exceeds the measured between-cycle variation.
- **Benchmark against the simple baseline:** CUSUM on composition. A learned method has to beat it to earn its place.

### 2.9 Reproducibility

Nextflow workflow, pinned containers, a versioned reference that never changes silently. Prototyped in Google Colab, the same containers running on Google Cloud, and the same workflow is what would deploy on board. Stack: scvi-tools, PyTorch, scanpy/anndata, Nextflow, Docker.

---

## 3. Output

### 3.1 Per sample, in flight

- **A percentile (0–100)** — where this month's distance from her own baseline falls in the distribution of normal between-cycle variation. *"92nd percentile."* Not a label, not a probability of disease.
- **A composition readout** — which cell types shifted and by how much, so the number is explainable rather than oracular.
- **An updated personal baseline**, carried into the next cycle.

Computed on board. No downlink required, which matters for Mars-distance latency.

### 3.2 From phase 0, regardless of whether anyone flies

- **The noise floor**: the first quantitative distribution of cycle-to-cycle variation in the menstrual transcriptome, as a reusable number rather than a heatmap.
- **A frozen, versioned reference** combining atlas-derived cell identity with cup-realistic composition.
- **A deconvolution signature** for bulk menstrual effluent, usable by anyone with a bulk assay and no single-cell facility.

### 3.3 Deliberately not claimed

- **We cannot separate the three spaceflight exposures.** Altered light–dark cycle, radiation and microgravity arrive together in every flight sample; with two to six astronauts no model disentangles them. We say so rather than implying otherwise.
- **We have no flight sample.** Everything upstream of it exists; that one piece does not.
- **Phase 2, not now:** wearables, skin temperature and urine hormone strips (mcPHASES, PhysioNet, restricted access — and the files were recently not downloadable, so nothing in phase 1 depends on it).

---

## References

1. Marečková M, et al. An integrated single-cell reference atlas of the human endometrium (HECA). *Nature Genetics* 2024. https://pubmed.ncbi.nlm.nih.gov/39198675/
2. Wang W, Vilella F, Alama P, et al. Single-cell transcriptomic atlas of the human endometrium during the menstrual cycle. *Nature Medicine* 2020;26:1644–53. GEO GSE111976
3. Shih AJ, Adelson RP, Vashistha H, et al. Single-cell analysis of menstrual endometrial tissues defines phenotypes associated with endometriosis. *BMC Medicine* 2022;20:315. GEO GSE203191
4. Schwalie PC, Bafligil C, Russeil J, et al. Single-cell characterization of menstrual fluid at homeostasis and in endometriosis. *eLife Reviewed Preprint* 2024. doi:10.7554/eLife.99558.1 · medRxiv 2024.05.06.24306766 · data Zenodo 10.5281/zenodo.11105267
5. Lopez R, Regier J, Cole MB, Jordan MI, Yosef N. Deep generative modeling for single-cell transcriptomics (scVI). *Nature Methods* 2018;15:1053–8.
6. Xu C, Lopez R, Mehlman E, et al. Probabilistic harmonization and annotation of single-cell transcriptomics data with deep generative models (scANVI). *Molecular Systems Biology* 2021;17:e9620.
7. Lotfollahi M, Naghipourfar M, Luecken MD, et al. Mapping single-cell data to reference atlases by transfer learning (scArches). *Nature Biotechnology* 2022;40:121–30.
8. Wang X, Park J, Susztak K, Zhang NR, Li M. Bulk tissue cell type deconvolution with multi-subject single-cell expression reference (MuSiC). *Nature Communications* 2019;10:380.
9. Chu T, Wang Z, Pe'er D, Danko CG. Cell type and gene expression deconvolution with BayesPrism. *Nature Cancer* 2022;3:505–17.
10. Vlasac IM, et al. Menstrual effluent methylation cytometry across collection devices. *Epigenetics* 2025. GEO GSE275888
11. Strock N, Rivas E, Marshall Goebel K. *The Effects of Space Flight and Microgravity Exposure on Female Astronaut Health and Performance.* KBR / NASA Johnson Space Center.
12. Jain V, Wotring VE. Medically induced amenorrhea in female astronauts. *npj Microgravity* 2016;2:16008.
13. JAXA Cell-Free Epigenome study, NASA OSDR OSD-530 · *Nature Communications* 2023, doi:10.1038/s41467-023-41995-z
14. Inspiration4 data access through the NASA Open Science Data Repository. *npj Microgravity* 2024. doi:10.1038/s41526-024-00393-5
15. Lin G, Li JY, Kalani K, Truong KN, Mariakakis A. A longitudinal dataset of physiological, hormonal, metabolic, and self-reported menstrual health data (mcPHASES). *Scientific Data* 2026;13(1):411.
16. Castro-Wallace SL, Chiu CY, John KK, et al. Nanopore DNA sequencing and genome assembly on the International Space Station. *Scientific Reports* 2017;7(1):18022. doi:10.1038/s41598-017-18364-0
17. Oxford Nanopore Technologies / UC Santa Cruz. *International Space Station update: direct RNA sequencing in space.* August 2018. https://nanoporetech.com/news/news-international-space-station-update-direct-rna-sequencing-space — press announcement, not peer-reviewed.
