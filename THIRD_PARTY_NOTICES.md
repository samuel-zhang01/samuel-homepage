# Third-party notices and content boundaries

This file records dependency and source attribution for Samuel System 7. It does
**not** grant a licence to the repository owner's code, writing, photographs,
documents, logos or other portfolio content. It does not convert a linked project
into open source. The rights and licence terms of each relevant owner continue to
apply.

## Runtime dependencies

The following declarations were checked against the installed package metadata
on 5 September 2026. Exact versions are locked in `package-lock.json`; preserve
the licence files distributed with those packages when redistributing them.

| Direct dependency | Checked version | Declared licence |
| --- | --- | --- |
| Next.js (`next`) | 15.5.22 | MIT |
| React (`react`) | 19.1.0 | MIT |
| React DOM (`react-dom`) | 19.1.0 | MIT |
| PDF.js (`pdfjs-dist`) | 5.4.624 | Apache-2.0 |

This is a direct-dependency summary, not a complete software bill of materials.
Transitive and platform-specific packages have their own terms. In the reviewed
installation, these include libvips under LGPL-3.0-or-later through `sharp`, and
`caniuse-lite` under CC-BY-4.0. Development tools also have separate licences.
Do not describe the complete application stack as MIT-licensed. Review the exact
target-platform dependency set and its obligations before distributing a compiled
application or container image; the local macOS installation is not a licence
inventory of the Linux production image.

### PDF.js browser files

The PDF viewer uses unmodified `pdf.min.mjs` and `pdf.worker.min.mjs` from the
locked `pdfjs-dist` package. Their upstream copyright and Apache notice headers
are retained. `npm run prepare:pdfjs` copies both files **and the complete package
`LICENSE`** into the generated `public/_vendor/pdfjs/` directory. The deployed
licence is available at `/_vendor/pdfjs/LICENSE`.

That generated directory is not tracked in Git. Development and production build
preparation recreate it from the installed package; deployments copy `public/`
including the licence. Keep the licence beside the files if redistributing that
directory independently. PDF documents displayed by the viewer are separate
content and do not inherit PDF.js's licence.

## Scientific methods and source attribution

### Clapeyron.jl

The thermodynamics workbench reimplements PC-SAFT equations and correlation
coefficients with attribution to Clapeyron.jl, reviewed at commit
`3c71bfa917a5bfc37bf01fef8f5adbcbddbf437a`. Its copyright notice is
**Copyright (c) 2020 Hon Wa Yew and Pierre Walker**.

The complete upstream MIT notice is retained in
[`ThermodynamicsStudio.tsx`](src/components/projects/ThermodynamicsStudio.tsx).
The independently implemented solid-liquid equilibrium workbench records its
Clapeyron attribution and pinned equation references in
[`DrugSolubilityStudio.tsx`](src/components/projects/DrugSolubilityStudio.tsx).
Both exhibits link to the [pinned upstream MIT licence](https://github.com/ClapeyronThermo/Clapeyron.jl/blob/3c71bfa917a5bfc37bf01fef8f5adbcbddbf437a/LICENSE.md).
Preserve the relevant notices when redistributing attributed implementations.
This attribution does not license private research repositories or their data.

### Orbital Lab

The educational model records its references in
[`src/lib/orbitals.ts`](src/lib/orbitals.ts): NIST atomic configuration and element
references, and University of Texas hydrogenic-wavefunction and spherical-harmonic
teaching references. The interface distinguishes the one-electron model from
neutral-atom subshell occupancies and labels heavier-element filling assumptions.
References identify scientific provenance; they are not a blanket reuse grant for
the source websites, their prose, illustrations or databases.

### Other research and teaching exhibits

Per-project source and privacy boundaries live in
[`src/data/projects.ts`](src/data/projects.ts) and the corresponding exhibit's
evidence panel. A link to a publicly viewable repository with no declared licence
is a reference, not permission to copy or relicense its contents.

The chemistry teaching exhibit explicitly credits the audited notebooks' author,
Micaela Matta, and their stated adaptations from sources including Towards AI,
the SciPython Book, TU Delft computational-physics lectures, the NZ Nano
molecular-dynamics tutorial, Psi4Education and Mecozzi et al. Its attribution
panel is in
[`ChemistryCodingStudio.tsx`](src/components/projects/ChemistryCodingStudio.tsx).
These credits do not claim original authorship of the underlying curriculum or
grant redistribution rights to the original course materials.

## Fonts, visual references and trademarks

The CSS names locally installed fonts, including Chicago and Geneva, with system
fallbacks. No font binaries are tracked or supplied by this repository. Availability
and rendering therefore depend on the visitor's device.

The interface is System 7-inspired, with hand-authored CSS and SVG artwork; it is
not an Apple product or an endorsed implementation. Apple, Macintosh and related
names remain associated with their respective rights holders. Third-party
product names and logos identify the referenced products; their appearance does
not grant trademark rights or imply endorsement.

## Portfolio content is a separate rights category

Photographs, CVs and their source documents, corporate presentations, educational
PDFs, derived figures, project narratives and branding must be considered
separately from software dependencies. Existing website display or an artifact's
presence in the repository is not a blanket permission to redistribute, modify
or relicense it.

The artifact gate verifies approved file bytes and guards against accidental
publication; it is **not** a copyright clearance or licence checker. Consult the
relevant rights holder before reusing portfolio assets. The owner's custom
[LICENSE](LICENSE) covers only the stated original work and preserves these
third-party and portfolio-content boundaries.
