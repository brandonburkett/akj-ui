// Stylelint config for legacy CSS ported from CRA. Rules that would force a
// rendering-risky or markup-breaking change are disabled here rather than
// applied. Appearance and all 8 breakpoints must stay identical.
export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
    // keep the non-standard webkit idioms autoprefixer can't generate:
    // appearance reset (button/textfield), iOS momentum scroll
    'property-no-vendor-prefix': [true, { ignoreProperties: ['appearance', 'overflow-scrolling'] }],
    // value-no-vendor-prefix + selector-no-vendor-prefix are inherited from config-standard (no override needed)
    // legacy class/id names are tied to the HTML; renaming would break markup
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    // keep classic (max-width: Npx) media syntax: universal support, preserves the 8 breakpoints verbatim
    'media-feature-range-notation': 'prefix',
  },
};
