// Stylelint config for legacy CSS ported from CRA. Rules that would force a
// rendering-risky or markup-breaking change are disabled here rather than
// applied. Appearance and all 8 breakpoints must stay identical.
export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // 6 real descending-specificity cases in the legacy CSS; fixing means reordering selectors (cascade risk)
    'no-descending-specificity': null,
    // keep the non-standard webkit idioms autoprefixer can't generate: appearance reset
    // (button/textfield), iOS momentum scroll. Regex matches the prefixed form stylelint 17 checks.
    'property-no-vendor-prefix': [true, { ignoreProperties: [/appearance$/, /overflow-scrolling$/] }],
    // value-no-vendor-prefix + selector-no-vendor-prefix are inherited from config-standard (no override needed)
    // .visuallyhidden hides content via `clip: rect(...)` — the robust screen-reader pattern; clip-path is not a drop-in
    'property-no-deprecated': [true, { ignoreProperties: ['clip'] }],
    // keep classic (max-width: Npx) media syntax: universal support, preserves the 8 breakpoints verbatim
    'media-feature-range-notation': 'prefix',
  },
};
