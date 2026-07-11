// Stylelint config for legacy CSS ported from CRA. Rules that would force a
// rendering-risky or markup-breaking change are disabled here rather than
// applied. Appearance and all 8 breakpoints must stay identical.
export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
    // keep vendor prefixes: the build has no autoprefixer, so they still serve target browsers
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    // legacy class/id names are tied to the HTML; renaming would break markup
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    // keep classic (max-width: Npx) media syntax: universal support, preserves the 8 breakpoints verbatim
    'media-feature-range-notation': 'prefix',
  },
};
