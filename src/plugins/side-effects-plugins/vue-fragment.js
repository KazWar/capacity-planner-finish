// This dependency is used to omit an issue in the permissions table for features.
// Swap to proper vue 3 implementation once vuetify supports vue 3.
// https://stackoverflow.com/questions/45000510/vue-js-error-component-template-should-contain-exactly-one-root-element
// https://www.npmjs.com/package/vue-frag

import Vue from 'vue'
import frag from 'vue-frag';

Vue.directive('frag', frag);

