/**
 * UI CONTROLLER & ACCESSIBLE INTERACTION ARCHITECT
 * Coordinates HTML overlays, floating navigation, 10-chapter waypoints,
 * the Generac Sourcing Evidence Drawer with reconciled calculations,
 * Workbench region filters, Inventory policy comparisons, Contact particle morphing,
 * Work Index modal, keyboard accessibility, and dependable fallback interaction.
 */

import { CHAPTER_DEFINITIONS } from './ChapterController.js';

export class UIController {
  constructor(chapterController) {
    this.chapterController = chapterController;
    this.activeEvidenceTab = 'mosfet';
    this.lastFocusedElement = null;

    this.cacheDomElements();
    this.setupEventListeners();
    this.setupKeyboardNavigation();
  }

  cacheDomElements() {
    this.hudKicker = document.getElementById('hud-phase-kicker');
    this.hudTitle = document.getElementById('hud-phase-title');
    this.hudProblem = document.getElementById('hud-phase-problem');
    this.hudImpact = document.getElementById('hud-phase-impact');
    this.hudContextBtn = document.getElementById('btn-open-evidence');

    this.entranceOverlay = document.getElementById('entrance-controls-overlay');
    this.enterBtn = document.getElementById('btn-enter-world');
    this.skipBtn = document.getElementById('btn-skip-intro');

    this.generacControls = document.getElementById('generac-scene-controls');
    this.explodeBtn = document.getElementById('btn-explode-toggle');

    this.uscDcControls = document.getElementById('uscdc-scene-controls');
    this.btnPareto = document.getElementById('btn-route-pareto');
    this.btnBaseline = document.getElementById('btn-route-baseline');

    this.workbenchControls = document.getElementById('workbench-scene-controls');
    this.inventoryControls = document.getElementById('inventory-scene-controls');
    this.contactControls = document.getElementById('contact-scene-controls');

    this.workIndexModal = document.getElementById('work-index-modal');
    this.btnOpenWorkIndex = document.getElementById('btn-open-work-index');
    this.btnCloseWorkIndex = document.getElementById('btn-close-work-index');

    this.evidenceDrawer = document.getElementById('generac-evidence-drawer');
    this.btnCloseEvidence = document.getElementById('btn-close-evidence');

    this.fallbackContainer = document.getElementById('hero-spatial-fallback');
    this.waypointButtons = document.querySelectorAll('.chapter-waypoint-btn');
  }

  setupEventListeners() {
    // Entrance: Enter button -> Starts strike animation
    if (this.enterBtn) {
      this.enterBtn.addEventListener('click', () => {
        if (this.chapterController.scenes.entrance) {
          this.enterBtn.classList.add('striking');
          this.chapterController.scenes.entrance.startStrike();
        }
      });
    }

    // Entrance: Skip Intro -> Instantly bypasses to Generac scene
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        if (this.chapterController.scenes.entrance) {
          this.chapterController.scenes.entrance.skipStrike();
        }
        this.chapterController.goToChapter(1);
      });
    }

    // Generac: Explode toggle
    if (this.explodeBtn) {
      this.explodeBtn.addEventListener('click', () => {
        const genScene = this.chapterController.scenes.generac;
        if (genScene) {
          genScene.toggleExplode();
          this.explodeBtn.classList.toggle('active', genScene.targetExplodeProgress > 0.5);
          this.explodeBtn.textContent = genScene.targetExplodeProgress > 0.5 ? 'Collapse Assembly' : 'Explode Assembly';
        }
      });
    }

    // Generac: Component Hotspot Buttons
    document.querySelectorAll('[data-component-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const comp = btn.getAttribute('data-component-target');
        const genScene = this.chapterController.scenes.generac;
        if (genScene) genScene.selectComponent(comp);
      });
    });

    // USC DC: Route toggles
    if (this.btnPareto && this.btnBaseline) {
      this.btnPareto.addEventListener('click', () => {
        this.chapterController.scenes['usc-dc']?.setRouteMode('PARETO');
        this.btnPareto.classList.add('active');
        this.btnBaseline.classList.remove('active');
      });
      this.btnBaseline.addEventListener('click', () => {
        this.chapterController.scenes['usc-dc']?.setRouteMode('BASELINE');
        this.btnBaseline.classList.add('active');
        this.btnPareto.classList.remove('active');
      });
    }

    // Chapter 06: Workbench Region Filter Buttons
    document.querySelectorAll('[data-workbench-region]').forEach(btn => {
      btn.addEventListener('click', () => {
        const region = btn.getAttribute('data-workbench-region');
        document.querySelectorAll('[data-workbench-region]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chapterController.scenes.workbench?.filterRegion(region);
      });
    });

    // Chapter 07: Inventory Policy Simulation Buttons
    document.querySelectorAll('[data-inventory-policy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const policy = btn.getAttribute('data-inventory-policy');
        document.querySelectorAll('[data-inventory-policy]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chapterController.scenes.inventory?.setPolicy(policy);
      });
    });

    // Evidence Drawer Tabs (All 5 Panes: mosfet, choke, capacitor, mcu, portfolio)
    document.querySelectorAll('.evidence-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          this.onComponentSelected(tab);
        }
      });
    });

    // Chapter 09: Contact Sculpture Actions
    document.querySelectorAll('[data-contact-action]').forEach(btn => {
      const action = btn.getAttribute('data-contact-action');
      const trigger = () => {
        document.querySelectorAll('[data-contact-action]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chapterController.scenes.contact?.setMorphTarget(action);
      };
      btn.addEventListener('click', trigger);
      btn.addEventListener('mouseenter', trigger);
      btn.addEventListener('focus', trigger);
    });

    // Global Contact Link Hover Binding (Email, LinkedIn, Resume)
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.addEventListener('mouseenter', () => this.chapterController.scenes.contact?.setMorphTarget('ENVELOPE'));
      a.addEventListener('focus', () => this.chapterController.scenes.contact?.setMorphTarget('ENVELOPE'));
    });
    document.querySelectorAll('a[href*="linkedin.com"]').forEach(a => {
      a.addEventListener('mouseenter', () => this.chapterController.scenes.contact?.setMorphTarget('LINKEDIN'));
      a.addEventListener('focus', () => this.chapterController.scenes.contact?.setMorphTarget('LINKEDIN'));
    });
    document.querySelectorAll('a[href*="Resume"], a[href*="resume"]').forEach(a => {
      a.addEventListener('mouseenter', () => this.chapterController.scenes.contact?.setMorphTarget('RESUME'));
      a.addEventListener('focus', () => this.chapterController.scenes.contact?.setMorphTarget('RESUME'));
    });

    // Work Index Modal
    if (this.btnOpenWorkIndex && this.workIndexModal) {
      this.btnOpenWorkIndex.addEventListener('click', () => this.openWorkIndex());
    }
    if (this.btnCloseWorkIndex && this.workIndexModal) {
      this.btnCloseWorkIndex.addEventListener('click', () => this.closeWorkIndex());
    }

    // Evidence Drawer
    if (this.hudContextBtn && this.evidenceDrawer) {
      this.hudContextBtn.addEventListener('click', () => this.openEvidenceDrawer());
    }
    if (this.btnCloseEvidence && this.evidenceDrawer) {
      this.btnCloseEvidence.addEventListener('click', () => this.closeEvidenceDrawer());
    }

    // Chapter Waypoint Navigation Buttons
    this.waypointButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-chapter');
        if (target !== null) {
          this.chapterController.goToChapter(isNaN(target) ? target : parseInt(target, 10));
        }
      });
    });

    // Timeline Prev / Next Arrow Controls
    const btnPrev = document.getElementById('btn-prev-chapter');
    const btnNext = document.getElementById('btn-next-chapter');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        const prev = Math.max(0, this.chapterController.currentChapterIndex - 1);
        this.chapterController.goToChapter(prev);
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const next = Math.min(CHAPTER_DEFINITIONS.length - 1, this.chapterController.currentChapterIndex + 1);
        this.chapterController.goToChapter(next);
      });
    }

    // Direct Jump to Contact
    const btnContact = document.getElementById('btn-contact-jump');
    if (btnContact) {
      btnContact.addEventListener('click', () => {
        this.chapterController.goToChapter(9);
      });
    }

    // Reduced Motion Force Toggle
    const btnMotion = document.getElementById('btn-motion-toggle');
    if (btnMotion) {
      btnMotion.addEventListener('click', () => {
        const isReduced = document.body.classList.toggle('force-reduced-motion');
        const icon = document.getElementById('motion-icon');
        if (icon) icon.textContent = isReduced ? '🛑' : '⚡';
      });
    }

    // Listen to Engine Chapter Changes
    document.addEventListener('engine:chapterchange', (e) => {
      this.onChapterChanged(e.detail.index, e.detail.id, e.detail.definition);
    });

    // Listen to Component Selection Events
    document.addEventListener('engine:componentselected', (e) => {
      this.onComponentSelected(e.detail.component);
    });
  }

  setupKeyboardNavigation() {
    window.addEventListener('keydown', (e) => {
      // Escape closes open modals
      if (e.key === 'Escape') {
        this.closeWorkIndex();
        this.closeEvidenceDrawer();
        return;
      }

      // Arrow keys advance / regress chapter if not inside input
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const next = Math.min(CHAPTER_DEFINITIONS.length - 1, this.chapterController.currentChapterIndex + 1);
        this.chapterController.goToChapter(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const prev = Math.max(0, this.chapterController.currentChapterIndex - 1);
        this.chapterController.goToChapter(prev);
      } else if (e.key >= '0' && e.key <= '9') {
        this.chapterController.goToChapter(parseInt(e.key, 10));
      }
    });
  }

  onChapterChanged(index, id, def) {
    // Update top station indicator badge
    const indicator = document.getElementById('hud-station-indicator');
    if (indicator && def) {
      indicator.textContent = `${def.number} / 09 · ${def.title.toUpperCase()}`;
    }

    // Update waypoint button active states
    this.waypointButtons.forEach((btn, i) => {
      const target = btn.getAttribute('data-chapter');
      const isActive = target === id || parseInt(target, 10) === index;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-current', isActive ? 'step' : 'false');
    });

    // Toggle Chapter Controls Visibility
    if (this.entranceOverlay) {
      this.entranceOverlay.classList.toggle('hidden', index !== 0);
    }
    if (this.generacControls) {
      this.generacControls.classList.toggle('hidden', index !== 1);
    }
    if (this.uscDcControls) {
      this.uscDcControls.classList.toggle('hidden', index !== 2);
    }
    if (this.workbenchControls) {
      this.workbenchControls.classList.toggle('hidden', index !== 6);
    }
    if (this.inventoryControls) {
      this.inventoryControls.classList.toggle('hidden', index !== 7);
    }
    if (this.contactControls) {
      this.contactControls.classList.toggle('hidden', index !== 9);
    }

    // Update HUD Cards with verified problem & result statements (concise, truthful, no em dashes)
    const dataMap = {
      0: {
        kicker: '00 / THRESHOLD',
        title: 'I connect the parts, people, and decisions that keep things moving.',
        problem: 'A recognizable Guts in Berserker Armor cleaves the threshold with the Dragon Slayer, opening the engineering and supply chain systems inside.',
        impact: 'Supply chain and operations. M.S. Engineering Management, USC (2026). Available January 2027.',
        showEvidence: false
      },
      1: {
        kicker: '01 / SOURCING & NPI · GENERAC',
        title: 'Every part has a bigger picture.',
        problem: 'A quote is only useful when the part number, demand, and evidence agree.',
        impact: 'Reconciled engineering BOMs, costed BOMs, supplier quotes, and annual demand across 20+ priority components. Identified $1.2M annualized sourcing opportunity. (Résumé-reported opportunity, not realized savings. Internal assembly is conceptual.)',
        showEvidence: true,
        evidenceLabel: 'View $1.2M Sourcing Breakdown'
      },
      2: {
        kicker: '02 / WAREHOUSE OPERATIONS · USC BOOKSTORE DC',
        title: 'Better flow starts on the floor.',
        problem: 'A thousand SKUs. One stock flow that needs to make sense.',
        impact: 'ERP-driven cycle counting, Excel reconciliation, process mapping, and slotting analysis to make inventory discrepancies visible and improve restocking. (>98% inventory accuracy. The route demonstration is illustrative.)',
        showEvidence: false
      },
      3: {
        kicker: '03 / TESTING OPERATIONS · VINDEEP EXPO ENGINEERS',
        title: 'Readiness is a system.',
        problem: 'The equipment is only one part of a successful inspection.',
        impact: 'Coordinated multi-site statutory testing for pressure vessels and lifting equipment, connecting schedules, risk registers, compliance records, and reporting. (15% less audit preparation time. The vessel illustrates the operating context.)',
        showEvidence: false
      },
      4: {
        kicker: '04 / MANUFACTURING SYSTEMS · LARSEN & TOUBRO',
        title: 'See the seam. Find the signal.',
        problem: 'Better monitoring brings the process into focus.',
        impact: 'Integrated SolidWorks prototypes, electrical subsystems, and Python automation in a portable welding seam-monitoring system, alongside supplier and feasibility analysis. (20% improvement in defect detection and process reliability. The monitoring pass is an explanatory animation.)',
        showEvidence: false
      },
      5: {
        kicker: '05 / QUALITY & PROCESS · BANCO PRODUCTS',
        title: 'Follow the problem upstream.',
        problem: 'A defect is a clue to the process that made it.',
        impact: 'Through RCA, FMEA, SPC, and Lean process audits, identified bottlenecks and applied Kaizen and 5S to welding cost improvement. (12% reduction in welding-related costs. Defect locations are illustrative, not an inspection record.)',
        showEvidence: false
      },
      6: {
        kicker: '06 / INDEPENDENT PROJECT · AI DECISION WORKBENCH',
        title: 'From plant data to a decision.',
        problem: 'A recommendation should lead back to its evidence.',
        impact: 'Built a Python MCP server exposing four governed tools: KPI segmentation, evidence retrieval, opportunity sizing, and recommendation generation over a simulated 12-plant network. (Portfolio diagram uses illustrative node positions. It is not a live MCP or ERP connection.)',
        showEvidence: false
      },
      7: {
        kicker: '07 / INDEPENDENT PROJECT · INVENTORY OPTIMIZATION',
        title: 'Same demand. Different decisions.',
        problem: 'What changes when you change the replenishment rule?',
        impact: 'Compared FOQ, LFL, and POQ with forecasting, cost modeling, and sensitivity analysis. (8–15% is modeled inventory-cost improvement, not achieved company savings. The interactive example uses separate sample inputs.)',
        showEvidence: false
      },
      8: {
        kicker: '08 / ACADEMIC FOUNDATION · USC & PDEU',
        title: 'Engineering, from two perspectives.',
        problem: 'Understand the physical system. Then improve how it works.',
        impact: 'M.S. in Engineering Management, USC Viterbi, expected December 2026. B.Tech. in Mechanical Engineering, Pandit Deendayal Petroleum University, May 2023.',
        showEvidence: false
      },
      9: {
        kicker: '09 / LET’S CONNECT · CONTACT',
        title: 'Let’s make things work better.',
        problem: 'I am looking for teams solving real supply chain, operations, and manufacturing problems.',
        impact: 'Available for full-time opportunities from January 2027. Contact: harshnil@usc.edu. Based in Los Angeles, open to relocation.',
        showEvidence: false
      }
    };

    const info = dataMap[index] || dataMap[0];
    if (this.hudKicker) this.hudKicker.textContent = info.kicker;
    if (this.hudTitle) this.hudTitle.textContent = info.title;
    if (this.hudProblem) this.hudProblem.textContent = info.problem;
    if (this.hudImpact) this.hudImpact.textContent = info.impact;

    if (this.hudContextBtn) {
      this.hudContextBtn.classList.toggle('hidden', !info.showEvidence);
      if (info.evidenceLabel) this.hudContextBtn.textContent = info.evidenceLabel;
    }
  }

  onComponentSelected(name) {
    this.activeEvidenceTab = name;
    this.openEvidenceDrawer();

    // Activate corresponding tab in drawer
    document.querySelectorAll('.evidence-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === name);
    });

    document.querySelectorAll('.evidence-tab-pane').forEach(pane => {
      const matches = pane.id === `tab-${name}`;
      pane.classList.toggle('active', matches);
      pane.style.display = matches ? 'block' : 'none';
    });
  }

  openWorkIndex() {
    if (this.workIndexModal) {
      this.lastFocusedElement = document.activeElement;
      this.workIndexModal.classList.remove('hidden');
      this.workIndexModal.setAttribute('aria-hidden', 'false');
      const firstBtn = this.workIndexModal.querySelector('button, a');
      if (firstBtn) firstBtn.focus();
    }
  }

  closeWorkIndex() {
    if (this.workIndexModal) {
      this.workIndexModal.classList.add('hidden');
      this.workIndexModal.setAttribute('aria-hidden', 'true');
      if (this.lastFocusedElement) this.lastFocusedElement.focus();
    }
  }

  openEvidenceDrawer() {
    if (this.evidenceDrawer) {
      this.lastFocusedElement = document.activeElement;
      this.evidenceDrawer.classList.remove('hidden');
      this.evidenceDrawer.setAttribute('aria-hidden', 'false');
      if (this.btnCloseEvidence) this.btnCloseEvidence.focus();
    }
  }

  closeEvidenceDrawer() {
    if (this.evidenceDrawer) {
      this.evidenceDrawer.classList.add('hidden');
      this.evidenceDrawer.setAttribute('aria-hidden', 'true');
      if (this.lastFocusedElement) this.lastFocusedElement.focus();
    }
  }
}
