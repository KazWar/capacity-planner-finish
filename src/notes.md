To do
=====

### General
1. Remove inline styling where-ever possible. Put it in the styles tag/external CSS.

### Vuex
1. Use namespaces for all nested modules to avoid an issue when calling state with ...mapstate
2. Add in an application store (Stores things such as the available features list.)

### Model
1. In user, changed editedOn to updatedOn.
2. In guardian, change the variable names of foundFeature, feature in the canUse method to something more sensible.

### Service
1. Split services into multiple sub-services
   E.G users-service, profiles-service, etc.
   grouped by logical groupings/API endpoints.

### Routes
1. Rename organization-profiles to profiles

### Administration page
1. Change the v-for into hard coded tiles because they're going to rarely change.

### Translation files
1. Once administration page is fixed, remove the route names from the translation file. They shouldn't be there.

### User settings
1. Fix route navigation url when navigating to own profile.
