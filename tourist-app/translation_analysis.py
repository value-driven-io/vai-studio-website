#!/usr/bin/env python3
"""
Translation Completeness Analysis for VAI Tourist App
Analyzes all language files and generates a comprehensive report.
"""

import json
import os
from collections import defaultdict, Counter
from typing import Dict, List, Set, Any
import argparse


class TranslationAnalyzer:
    def __init__(self, locales_dir: str):
        self.locales_dir = locales_dir
        self.languages = {}
        self.all_keys = set()
        self.language_names = {
            'en': 'English',
            'fr': 'French',
            'es': 'Spanish',
            'de': 'German',
            'it': 'Italian',
            'ty': 'Tahitian'
        }

    def load_translations(self):
        """Load all translation files"""
        for lang_code in self.language_names.keys():
            file_path = os.path.join(self.locales_dir, f"{lang_code}.json")
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        self.languages[lang_code] = json.load(f)
                    print(f"✓ Loaded {lang_code}.json")
                except Exception as e:
                    print(f"✗ Error loading {lang_code}.json: {e}")
            else:
                print(f"✗ File not found: {file_path}")

    def extract_all_keys(self, obj: Dict, prefix: str = "") -> Set[str]:
        """Recursively extract all translation keys from nested objects"""
        keys = set()
        for key, value in obj.items():
            full_key = f"{prefix}.{key}" if prefix else key
            keys.add(full_key)
            if isinstance(value, dict):
                keys.update(self.extract_all_keys(value, full_key))
        return keys

    def get_nested_value(self, obj: Dict, key_path: str) -> Any:
        """Get value from nested object using dot notation"""
        keys = key_path.split('.')
        current = obj
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return None
        return current

    def analyze_completeness(self) -> Dict:
        """Analyze translation completeness across all languages"""
        # Collect all possible keys from all languages
        for lang_code, translations in self.languages.items():
            self.all_keys.update(self.extract_all_keys(translations))

        analysis = {
            'total_keys': len(self.all_keys),
            'languages': {},
            'missing_translations': defaultdict(list),
            'empty_translations': defaultdict(list),
            'structural_issues': defaultdict(list)
        }

        # Analyze each language
        for lang_code, translations in self.languages.items():
            lang_keys = self.extract_all_keys(translations)
            missing_keys = self.all_keys - lang_keys

            # Find empty translations
            empty_keys = []
            for key in lang_keys:
                value = self.get_nested_value(translations, key)
                if value == "" or value is None:
                    empty_keys.append(key)

            # Calculate completion rate
            total_possible = len(self.all_keys)
            completed = total_possible - len(missing_keys) - len(empty_keys)
            completion_rate = (completed / total_possible * 100) if total_possible > 0 else 0

            analysis['languages'][lang_code] = {
                'name': self.language_names[lang_code],
                'total_keys': len(lang_keys),
                'missing_keys': len(missing_keys),
                'empty_keys': len(empty_keys),
                'completed_keys': completed,
                'completion_rate': completion_rate
            }

            analysis['missing_translations'][lang_code] = sorted(missing_keys)
            analysis['empty_translations'][lang_code] = sorted(empty_keys)

        return analysis

    def categorize_keys_by_priority(self, keys: List[str]) -> Dict[str, List[str]]:
        """Categorize missing keys by priority based on their context"""
        critical = []
        important = []
        minor = []

        for key in keys:
            key_lower = key.lower()

            # Critical: Core functionality, navigation, errors
            if any(term in key_lower for term in [
                'common.', 'navigation.', 'error', 'booking', 'payment',
                'form.', 'validation.', 'button', 'save', 'cancel', 'continue',
                'loading', 'success', 'failed'
            ]):
                critical.append(key)
            # Important: User experience, tour details, status
            elif any(term in key_lower for term in [
                'tour', 'activity', 'status', 'detail', 'price', 'time',
                'participant', 'requirement', 'inclusion', 'message'
            ]):
                important.append(key)
            # Minor: Nice-to-have, descriptions, help text
            else:
                minor.append(key)

        return {
            'critical': sorted(critical),
            'important': sorted(important),
            'minor': sorted(minor)
        }

    def find_structural_inconsistencies(self) -> Dict[str, List[str]]:
        """Find structural differences between language files"""
        inconsistencies = defaultdict(list)

        # Get structure of English (reference)
        if 'en' not in self.languages:
            return inconsistencies

        en_structure = self.get_structure(self.languages['en'])

        for lang_code, translations in self.languages.items():
            if lang_code == 'en':
                continue

            lang_structure = self.get_structure(translations)

            # Find structure differences
            en_sections = set(en_structure.keys())
            lang_sections = set(lang_structure.keys())

            missing_sections = en_sections - lang_sections
            extra_sections = lang_sections - en_sections

            if missing_sections:
                inconsistencies[lang_code].extend([f"Missing section: {s}" for s in missing_sections])
            if extra_sections:
                inconsistencies[lang_code].extend([f"Extra section: {s}" for s in extra_sections])

        return inconsistencies

    def get_structure(self, obj: Dict, depth: int = 2) -> Dict:
        """Get the structure of translation object up to specified depth"""
        structure = {}
        for key, value in obj.items():
            if isinstance(value, dict) and depth > 1:
                structure[key] = self.get_structure(value, depth - 1)
            else:
                structure[key] = type(value).__name__
        return structure

    def generate_report(self) -> str:
        """Generate a comprehensive markdown report"""
        analysis = self.analyze_completeness()

        report = []
        report.append("# Translation Completeness Analysis Report")
        report.append(f"**Generated on**: {os.popen('date').read().strip()}")
        report.append(f"**Total Translation Keys**: {analysis['total_keys']}")
        report.append("")

        # Overview table
        report.append("## 📊 Overview Summary")
        report.append("")
        report.append("| Language | Total Keys | Missing | Empty | Completed | Completion Rate |")
        report.append("|----------|------------|---------|-------|-----------|-----------------|")

        for lang_code, stats in analysis['languages'].items():
            report.append(f"| {stats['name']} ({lang_code}) | {stats['total_keys']} | {stats['missing_keys']} | {stats['empty_keys']} | {stats['completed_keys']} | {stats['completion_rate']:.1f}% |")

        report.append("")

        # Detailed analysis per language
        report.append("## 🔍 Detailed Analysis by Language")
        report.append("")

        for lang_code, stats in analysis['languages'].items():
            report.append(f"### {stats['name']} ({lang_code})")
            report.append("")
            report.append(f"- **Completion Rate**: {stats['completion_rate']:.1f}%")
            report.append(f"- **Missing Keys**: {stats['missing_keys']}")
            report.append(f"- **Empty Values**: {stats['empty_keys']}")
            report.append("")

            # Missing translations by priority
            if analysis['missing_translations'][lang_code]:
                missing_keys = analysis['missing_translations'][lang_code]
                categorized = self.categorize_keys_by_priority(missing_keys)

                if categorized['critical']:
                    report.append("#### 🚨 Critical Missing Keys")
                    for key in categorized['critical'][:10]:  # Show top 10
                        report.append(f"- `{key}`")
                    if len(categorized['critical']) > 10:
                        report.append(f"- ... and {len(categorized['critical']) - 10} more critical keys")
                    report.append("")

                if categorized['important']:
                    report.append("#### ⚠️ Important Missing Keys")
                    for key in categorized['important'][:10]:  # Show top 10
                        report.append(f"- `{key}`")
                    if len(categorized['important']) > 10:
                        report.append(f"- ... and {len(categorized['important']) - 10} more important keys")
                    report.append("")

            # Empty translations
            if analysis['empty_translations'][lang_code]:
                report.append("#### 🔤 Empty Translation Values")
                empty_keys = analysis['empty_translations'][lang_code][:10]
                for key in empty_keys:
                    report.append(f"- `{key}`")
                if len(analysis['empty_translations'][lang_code]) > 10:
                    report.append(f"- ... and {len(analysis['empty_translations'][lang_code]) - 10} more empty values")
                report.append("")

            report.append("---")
            report.append("")

        # Structural issues
        structural_issues = self.find_structural_inconsistencies()
        if any(structural_issues.values()):
            report.append("## 🏗️ Structural Inconsistencies")
            report.append("")
            for lang_code, issues in structural_issues.items():
                if issues:
                    lang_name = self.language_names.get(lang_code, lang_code)
                    report.append(f"### {lang_name} ({lang_code})")
                    for issue in issues:
                        report.append(f"- {issue}")
                    report.append("")

        # Recommendations
        report.append("## 💡 Recommendations")
        report.append("")

        # Find language with highest completion rate as reference
        best_lang = max(analysis['languages'].items(), key=lambda x: x[1]['completion_rate'])
        worst_lang = min(analysis['languages'].items(), key=lambda x: x[1]['completion_rate'])

        report.append("### Priority Actions:")
        report.append("")
        report.append(f"1. **Focus on {worst_lang[1]['name']}**: Lowest completion rate at {worst_lang[1]['completion_rate']:.1f}%")
        report.append(f"2. **Use {best_lang[1]['name']} as reference**: Highest completion rate at {best_lang[1]['completion_rate']:.1f}%")
        report.append("")

        # Critical missing keys across all languages
        all_critical = set()
        for lang_code in analysis['missing_translations']:
            missing = analysis['missing_translations'][lang_code]
            critical = self.categorize_keys_by_priority(missing)['critical']
            all_critical.update(critical)

        if all_critical:
            report.append("### Critical Keys Missing Across Languages:")
            report.append("")
            common_critical = []
            for key in all_critical:
                missing_count = sum(1 for lang_code in analysis['missing_translations']
                                 if key in analysis['missing_translations'][lang_code])
                if missing_count >= 2:  # Missing in 2+ languages
                    common_critical.append((key, missing_count))

            common_critical.sort(key=lambda x: x[1], reverse=True)
            for key, count in common_critical[:15]:
                langs_missing = [lang for lang in analysis['missing_translations']
                               if key in analysis['missing_translations'][lang]]
                report.append(f"- `{key}` (missing in: {', '.join(langs_missing)})")
            report.append("")

        report.append("### Implementation Strategy:")
        report.append("")
        report.append("1. **Phase 1**: Complete all critical missing keys")
        report.append("2. **Phase 2**: Fill empty translation values")
        report.append("3. **Phase 3**: Add important missing keys")
        report.append("4. **Phase 4**: Review and add minor keys as needed")
        report.append("")
        report.append("### Quality Assurance:")
        report.append("")
        report.append("- Set up translation validation in CI/CD")
        report.append("- Create translation guidelines for consistency")
        report.append("- Regular audits of new features for translation coverage")
        report.append("- Consider using translation management tools")

        return "\n".join(report)


def main():
    parser = argparse.ArgumentParser(description='Analyze translation completeness')
    parser.add_argument('--locales-dir',
                       default='/Users/desilva/Desktop/vai-studio-website/tourist-app/src/locales',
                       help='Path to locales directory')
    parser.add_argument('--output', '-o',
                       default='translation_analysis_report.md',
                       help='Output file for the report')

    args = parser.parse_args()

    print("🌍 Starting Translation Analysis...")
    print(f"📁 Locales directory: {args.locales_dir}")
    print("")

    analyzer = TranslationAnalyzer(args.locales_dir)
    analyzer.load_translations()

    print("\n🔍 Analyzing translations...")
    report = analyzer.generate_report()

    print(f"\n📝 Writing report to {args.output}...")
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"✅ Analysis complete! Report saved to {args.output}")

    # Print quick summary
    analysis = analyzer.analyze_completeness()
    print("\n📊 Quick Summary:")
    for lang_code, stats in analysis['languages'].items():
        print(f"  {stats['name']}: {stats['completion_rate']:.1f}% complete ({stats['missing_keys']} missing, {stats['empty_keys']} empty)")


if __name__ == "__main__":
    main()