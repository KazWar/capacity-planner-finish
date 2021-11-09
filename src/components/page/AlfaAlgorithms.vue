<template>
  <div class="data">
    <page-content>
      <algorithms :getAlgorithmsFullPath="'https://ws20cpa100-node-t.ase20be01-ta.p.azurewebsites.net/api/Services/allowedOrganizationsAndAlgorithmUsers'"
                  :urlBaas="'https://ws20cpa100-alpha-t.ase20fe01-ta.p.azurewebsites.net/api/'"
                  :urlMaas="'https://ws20cpa100-node-t.ase20be01-ta.p.azurewebsites.net/api/'"></algorithms>
    </page-content>
  </div>
</template>

<script>
  import Algorithms from '@/components/alfa/services/Algorithms'

  export default {
    name: "AlfaAlgorithms",
    components: { Algorithms }
  }
</script>

<style scoped>

</style>
