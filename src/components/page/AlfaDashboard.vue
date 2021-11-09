<template>
  <div class="data">
    <page-content>
      <dashboard
        :getAlgorithmsFullPath="'https://ws20cpa100-node-t.ase20be01-ta.p.azurewebsites.net/api/Services/allowedOrganizationsAndAlgorithmUsers'"
        :urlBaas="'https://ws20cpa100-alpha-t.ase20fe01-ta.p.azurewebsites.net/api/'"
        :urlMaas="'https://ws20cpa100-node-t.ase20be01-ta.p.azurewebsites.net/api/'"></dashboard>
    </page-content>
  </div>
</template>

<script>
  import Dashboard from '@/components/alfa/dashboard/Dashboard'

  export default {
    name: 'AlfaDashboard',
    components: { Dashboard }
  }
</script>

<style scoped>

</style>
