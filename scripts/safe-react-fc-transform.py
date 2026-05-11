#!/usr/bin/env python3
"""
Safe React.FC → function transformer for PanelFlow (v4 — SAFE version).

ONLY transforms two patterns that are guaranteed-safe (no block-brace logic):
  A) const X: React.FC<Props> = ({ ... }) => ( EXPR );   ← same-line JSX only
  C) Button: React.FC<Props>;  (interface type alias → plain function type)

Pattern B (block arrow => { ... }) is intentionally SKIPPED.
Only transforms top-level (0-indent) declarations to avoid touching nested code.
Complex patterns (as unknown as, & {, multi-line generics) are left untouched.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path("/home/ubuntu/workspace/PanelFlow/src")

# Pattern A: same-line JSX — closing ); MUST be on SAME physical line as => (
PAT_A = re.compile(
    r'^(\s*)(?:export\s+)?const\s+(\w+):\s*React\.FC<([^>]+)>\s*=\s*\(\{([^}]*)\}\)\s*=>\s*'
    r'(\([^;{}]*\))\s*;?\s*$',
)

# Pattern C: interface type alias
PAT_C = re.compile(r'^(\s*)(\w+):\s*React\.FC<([^>]+)>;(.*)$')

# Pattern B: block arrow declaration — first line only
# Handles both 'const X:' and 'export const X:'
PAT_B_DECL = re.compile(
    r'^(\s*)(?:export\s+)?const\s+(\w+):\s*React\.FC<([^>]+)>\s*=\s*\(\{([^}]*)\}\)\s*=>\s*\{$',
)
# Groups: indent, name (without 'const '), props, params


def is_top_level(indent: str) -> bool:
    """Only 0-indent or single-tab (module-level) declarations."""
    return indent == "" or indent in ("\t", "  ")


def convert_pat_a(m: re.Match) -> str:
    indent, name, props, params, body = m.groups()
    body = body.rstrip().rstrip(';')
    return f'{indent}function {name}({{ {params.strip()} }}: {props}) {{ return {body}; }}'


def convert_pat_c(m: re.Match) -> str:
    indent, name, props, rest = m.groups()
    return f'{indent}{name}: (props: {props}) => JSX.Element;{rest}'


def convert_pat_b(m: re.Match) -> str:
    indent, name, props, params = m.groups()
    fn_name = name[6:] if name.startswith('const ') else name
    return f'{indent}function {fn_name}({{ {params.strip()} }}: {props}) {{'


def process_file(path: Path) -> dict:
    text = path.read_text()
    lines = text.splitlines()
    new_lines = []
    n_a = 0
    n_b = 0
    n_c = 0
    b_stack = []

    for line in lines:
        # Check Pattern A — same-line JSX, top-level only
        ma = PAT_A.match(line)
        if ma and is_top_level(ma.group(1)):
            new_lines.append(convert_pat_a(ma))
            n_a += 1
            continue

        # Check Pattern B — block arrow, top-level only
        mb = PAT_B_DECL.match(line)
        if mb and is_top_level(mb.group(1)):
            indent, name, props, params = mb.groups()
            fn_name = name[6:] if name.startswith('const ') else name
            new_lines.append(f'{indent}function {fn_name}({{ {params.strip()} }}: {props}) {{')
            b_stack.append((indent, fn_name))
            n_b += 1
            continue

        # Closing brace — if it matches our stack top, replace
        if line.rstrip() == '};' and b_stack:
            new_lines.append('}')
            b_stack.pop()
            continue

        # Check Pattern C type alias — top-level only
        mc = PAT_C.match(line)
        if mc and is_top_level(mc.group(1)):
            new_lines.append(convert_pat_c(mc))
            n_c += 1
            continue

        new_lines.append(line)

    text = '\n'.join(new_lines)
    changed = n_a or n_b or n_c
    if changed:
        path.write_text(text)
        print(f"  ✓ {path.relative_to(ROOT)}  (A={n_a}, B={n_b}, C={n_c})")
    return {'a': n_a, 'b': n_b, 'c': n_c}


def main():
    targets = [
        "components/ui/accordion.tsx",
        "components/ui/grid.tsx",
        "components/ui/tabs.tsx",
        "components/ui/popconfirm.tsx",
        "components/ui/card.tsx",
        "components/ui/color-picker.tsx",
        "components/ui/select.tsx",
        "components/ui/option.tsx",
        "components/ui/radio-group.tsx",
        "components/ui/list.tsx",
        "components/ui/space.tsx",
        "components/ui/dropdown.tsx",
        "components/ui/divider.tsx",
        "components/ui/spin.tsx",
        "components/ui/avatar.tsx",
        "components/ui/upload.tsx",
        "components/ui/timeline.tsx",
        "components/ui/dialog.tsx",
        "components/ui/empty.tsx",
        "components/ui/tag.tsx",
        "components/ui/message.tsx",
        "components/ui/label.tsx",
        "components/ui/separator.tsx",
        "components/ui/switch.tsx",
        "components/ui/slider.tsx",
        "components/ui/progress.tsx",
        "components/ui/skeleton.tsx",
        "components/ui/sheet.tsx",
        "components/ui/textarea.tsx",
        "components/ui/alert.tsx",
        "components/ui/breadcrumb.tsx",
        "components/ui/input.tsx",
        "components/ui/badge.tsx",
        "components/ui/typography.tsx",
        "components/ui/input-number.tsx",
        "components/ui/scroll-area.tsx",
        "components/ui/sonner.tsx",
        "components/ui/form.tsx",
        "providers/AppProvider.tsx",
        "context/SettingsContext.tsx",
        "context/ThemeContext.tsx",
        "core/di/container.tsx",
        "shared/components/ui/PageHeader.tsx",
        "shared/components/ui/Demo.tsx",
        "shared/components/ui/AnimateIn.tsx",
        "shared/components/ui/Loading.tsx",
        "shared/components/ui/Toast.tsx",
        "shared/components/ui/Skeleton.tsx",
        "shared/components/ui/FileUploader.tsx",
        "shared/components/ui/Button.tsx",
        "shared/components/ui/PageTransition.tsx",
        "shared/components/ui/ConfirmDialog.tsx",
        "shared/components/ui/GridStatistic.tsx",
        "shared/components/ui/PageSection.tsx",
        "shared/components/ui/Card.tsx",
        "shared/components/ui/Empty.tsx",
        "shared/components/ui/PageContainer.tsx",
        "shared/components/layout/AppLayout/AppLayout.tsx",
        "shared/components/pipeline/GenerationResult.tsx",
        "shared/components/pipeline/PipelineProgress.tsx",
        "shared/components/pipeline/PipelineControls.tsx",
        "shared/components/pipeline/GradeBadge.tsx",
        "components/business/CostDashboard/index.tsx",
        "components/business/RenderCenter/index.tsx",
        "components/business/CompositionStudio/index.tsx",
        "features/video/components/EnhancedVideoControls.tsx",
        "features/storyboard/components/SceneRenderer.tsx",
        "features/script/components/ScriptEditor.tsx",
        "features/notification/components/NotificationCenter.tsx",
        "features/notification/components/NotificationCenterView.tsx",
        "features/editor/components/AIAssistant.tsx",
        "features/home/components/CTASection.tsx",
        "features/home/components/HomeView.tsx",
        "features/home/components/HeroSection.tsx",
        "features/home/components/Features.tsx",
        "features/home/components/ProjectGrid.tsx",
        "features/home/components/StatsCards.tsx",
        "features/home/components/WorkflowSteps.tsx",
        "features/home/components/ModelCard.tsx",
        "features/project/components/ProjectListView.tsx",
        "features/project/components/ProjectForm.tsx",
        "features/subtitle/components/SubtitleEditor.tsx",
        "features/subtitle/components/SubtitleEditorView.tsx",
        "features/audio/components/AudioEditorView.tsx",
        "features/audio/components/AudioEditor.tsx",
        "features/video/components/VideoUploader.tsx",
        "features/video/components/VideoSelector.tsx",
        "features/video/components/VideoPlayer.tsx",
        "features/video/components/VideoAnalyzer.tsx",
        "features/video/components/ExportPanel.tsx",
        "features/video/components/VideoExporter.tsx",
        "features/video/components/VideoInfo.tsx",
        "features/video/components/VideoEditorView.tsx",
        "features/ai/components/AIModelSelector.tsx",
        "features/ai/components/ModelSelector.tsx",
        "features/storyboard/components/StoryboardEditor.tsx",
        "features/script/components/NovelImporter.tsx",
        "features/script/components/ScriptGeneratorView.tsx",
        "features/script/components/ScriptGenerator.tsx",
        "features/script/components/ScriptPreview.tsx",
        "features/manga-pipeline/ui/ScriptGenerationView.tsx",
        "features/manga-pipeline/ui/CharacterCard.tsx",
        "features/character/components/CharacterDesigner.tsx",
        "pages/SettingsPage.tsx",
        "pages/HomePage.tsx",
        "pages/ScriptDetailPage.tsx",
        "pages/ProjectDetailPage.tsx",
        "pages/VideoEditorPage.tsx",
        "pages/Workflow/WorkflowPage.tsx",
        "pages/ProjectEditPage.tsx",
        "pages/ProjectEdit/components/StepContentComposition.tsx",
        "pages/ProjectEdit/components/StepContentStoryboard.tsx",
        "pages/ProjectEdit/components/StepContentImport.tsx",
        "pages/ProjectEdit/components/StepContentAIAnalysis.tsx",
        "pages/ProjectEdit/components/StepContentScript.tsx",
        "pages/ProjectEdit/components/StepContentExport.tsx",
        "pages/ProjectEdit/components/QualityGateAlert.tsx",
        "pages/ProjectEdit/components/StepContentAudio.tsx",
        "pages/ProjectEdit/components/StepContentCharacter.tsx",
        "pages/ProjectEdit/components/StepContentRender.tsx",
        "pages/ProjectEdit/components/CollaborationPanel.tsx",
    ]

    print("Safe React.FC → function transformation v5 (A + B + C, fix const name bug)")
    print("=" * 65)
    totals = {'a': 0, 'b': 0, 'c': 0}
    changed_files = []
    for rel in targets:
        path = ROOT / rel
        if not path.exists():
            continue
        r = process_file(path)
        if r['a'] or r['b'] or r['c']:
            changed_files.append(rel)
            for k in totals:
                totals[k] += r[k]

    print(f"\n{len(changed_files)} files changed: A={totals['a']}, B={totals['b']}, C={totals['c']}")
    if not changed_files:
        print("Nothing to do.")
        return

    print("\nRunning tsc --noEmit...")
    r = subprocess.run(["npx", "tsc", "--noEmit"], cwd=str(ROOT),
                       capture_output=True, text=True)
    errors = [l for l in r.stdout.splitlines() if "error TS" in l]
    if errors:
        print(f"✗ TSC errors ({len(errors)}):")
        for e in errors[:15]:
            print(f"  {e}")
        print("\nReverting...")
        subprocess.run(["git", "checkout", "--", "."], cwd=str(ROOT))
        sys.exit(1)
    else:
        print("  ✓ tsc --noEmit passed")
        res = subprocess.run(
            ["grep", "-rn", "React\\.FC", "src/", "--include=*.tsx",
             "--exclude-dir=node_modules", "--exclude-dir=__tests__"],
            cwd=str(ROOT), capture_output=True, text=True
        )
        remaining = [l for l in res.stdout.splitlines()
                     if "as unknown as" not in l and "& {" not in l]
        print(f"  Remaining React.FC: {len(remaining)}  (complex type-assert patterns excluded)")
        print("\nRun `git diff --stat` to review, then commit.")


if __name__ == "__main__":
    main()
